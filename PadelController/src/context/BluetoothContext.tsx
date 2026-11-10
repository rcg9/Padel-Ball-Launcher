import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import {
  BluetoothState,
  EffectType,
  buildAngleHCommand,
  buildAngleVCommand,
  buildSpeedCommand,
  buildEffectCommand,
  buildShotCommand,
  buildPowerCommand,
} from '../utils/protocol';

// ======= HELPERS BASE64 =======
// React Native no sempre exposa atob/btoa amb tipus TypeScript.
// Implementem funcions pròpies per codificar/decodificar base64.
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function toBase64(input: string): string {
  let output = '';
  for (let i = 0; i < input.length; i += 3) {
    const a = input.charCodeAt(i);
    const b = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    const c = i + 2 < input.length ? input.charCodeAt(i + 2) : 0;
    output += BASE64_CHARS.charAt(a >> 2);
    output += BASE64_CHARS.charAt(((a & 3) << 4) | (b >> 4));
    output += i + 1 < input.length ? BASE64_CHARS.charAt(((b & 15) << 2) | (c >> 6)) : '=';
    output += i + 2 < input.length ? BASE64_CHARS.charAt(c & 63) : '=';
  }
  return output;
}

function fromBase64(input: string): string {
  let output = '';
  const str = input.replace(/=+$/, '');
  for (let i = 0; i < str.length; i += 4) {
    const a = BASE64_CHARS.indexOf(str.charAt(i));
    const b = BASE64_CHARS.indexOf(str.charAt(i + 1));
    const c = BASE64_CHARS.indexOf(str.charAt(i + 2));
    const d = BASE64_CHARS.indexOf(str.charAt(i + 3));
    output += String.fromCharCode((a << 2) | (b >> 4));
    if (c !== -1) output += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    if (d !== -1) output += String.fromCharCode(((c & 3) << 6) | d);
  }
  return output;
}

// ======= CONFIGURACIÓ BLE UART =======
// UUIDs comuns per mòduls BLE UART (HM-10, HC-08, HC-05 BLE)
const BLE_UART_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb';
const BLE_UART_CHAR = '0000ffe1-0000-1000-8000-00805f9b34fb';

// Singleton BLE Manager
const bleManager = new BleManager();

const BluetoothContext = createContext<BluetoothState | undefined>(undefined);

interface BluetoothProviderProps {
  children: React.ReactNode;
}

/**
 * Demana els permisos necessaris per BLE.
 * Android 12+ necessita BLUETOOTH_CONNECT i BLUETOOTH_SCAN.
 * Android 11 o inferior necessita ACCESS_FINE_LOCATION per escaneig BLE.
 */
export const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

export const BluetoothProvider: React.FC<BluetoothProviderProps> = ({ children }) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMachineOn, setIsMachineOn] = useState(false);
  const [angleH, setAngleH] = useState(90);
  const [angleV, setAngleV] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [effect, setEffect] = useState<EffectType>('NR');
  const [logs, setLogs] = useState<string[]>([]);

  const notificationSubRef = useRef<any>(null);
  const readBufferRef = useRef<string>('');
  const disconnectSubRef = useRef<any>(null);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => {
      const newLogs = [...prev, message];
      return newLogs.slice(-10);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const stopReading = useCallback(() => {
    if (notificationSubRef.current) {
      notificationSubRef.current.remove();
      notificationSubRef.current = null;
    }
  }, []);

  // Subscriu a notificacions BLE per rebre dades del mòdul
  const startReading = useCallback(
    (connectedDevice: Device) => {
      stopReading();
      readBufferRef.current = '';

      notificationSubRef.current = connectedDevice.monitorCharacteristicForService(
        BLE_UART_SERVICE,
        BLE_UART_CHAR,
        (error, characteristic) => {
          if (error) {
            console.debug('BLE notification error:', error.message);
            return;
          }
          if (characteristic?.value) {
            // Decodifica base64 a string
            const decoded = fromBase64(characteristic.value);
            readBufferRef.current += decoded;

            // Processa missatges complets (delimitats per \n)
            const parts = readBufferRef.current.split('\n');
            readBufferRef.current = parts.pop() || '';

            for (const part of parts) {
              const message = part.trim();
              if (message) {
                addLog(`RX: ${message}`);
                if (message === 'ST:ON') {
                  setIsMachineOn(true);
                } else if (message === 'ST:OFF') {
                  setIsMachineOn(false);
                } else if (message.startsWith('CFG:')) {
                  // Exemple de format: CFG:COP=DR;H=90;V=25;S=55;EF=NR
                  const configString = message.substring(4);
                  const pairs = configString.split(';');
                  
                  pairs.forEach(pair => {
                    const [key, value] = pair.split('=');
                    if (key === 'H') {
                      const val = parseInt(value, 10);
                      if (!isNaN(val)) setAngleH(val);
                    } else if (key === 'V') {
                      const val = parseInt(value, 10);
                      if (!isNaN(val)) setAngleV(val);
                    } else if (key === 'S') {
                      const val = parseInt(value, 10);
                      if (!isNaN(val)) setSpeed(val);
                    } else if (key === 'EF') {
                      setEffect(value as EffectType);
                    }
                  });
                }
              }
            }
          }
        }
      );
    },
    [addLog, stopReading]
  );

  // Envia una comanda al mòdul BLE
  const sendCommand = useCallback(
    async (cmd: string) => {
      if (!device || !isConnected) {
        addLog('ERR: No connected');
        return;
      }

      addLog(`TX: ${cmd.trim()}`);

      try {
        const base64Data = toBase64(cmd);
        // Prova primer amb resposta, si falla, sense resposta
        try {
          await device.writeCharacteristicWithResponseForService(
            BLE_UART_SERVICE,
            BLE_UART_CHAR,
            base64Data
          );
        } catch {
          await device.writeCharacteristicWithoutResponseForService(
            BLE_UART_SERVICE,
            BLE_UART_CHAR,
            base64Data
          );
        }
        addLog('TX: OK');
      } catch (error: any) {
        addLog(`TX ERR: ${error?.message || String(error)}`);
      }
    },
    [device, isConnected, addLog]
  );

  // Connecta a un dispositiu BLE
  const connectDevice = useCallback(
    async (selectedDevice: Device): Promise<boolean> => {
      const hasPermissions = await requestBluetoothPermissions();

      if (!hasPermissions) {
        Alert.alert('Permisos necessaris', 'Cal atorgar permisos Bluetooth');
        return false;
      }

      setIsConnecting(true);

      const deviceName = selectedDevice.name || selectedDevice.id || 'dispositiu';
      addLog(`Connecting to ${deviceName}...`);

      try {
        // Connecta al dispositiu BLE
        const connected = await bleManager.connectToDevice(selectedDevice.id, {
          requestMTU: 185,
        });

        // Descobreix serveis i característiques
        addLog('Discovering services...');
        const discovered = await connected.discoverAllServicesAndCharacteristics();

        // Verifica que el servei UART existeix
        const services = await discovered.services();
        const uartService = services.find(
          s => s.uuid.toLowerCase() === BLE_UART_SERVICE
        );

        if (!uartService) {
          const uuids = services.map(s => s.uuid).join(', ');
          addLog(`Services: ${uuids}`);
          throw new Error('Servei UART (FFE0) no trobat. Potser el mòdul usa UUIDs diferents.');
        }

        addLog('UART service found!');

        // Verifica la característica UART
        const chars = await discovered.characteristicsForService(BLE_UART_SERVICE);
        const uartChar = chars.find(
          c => c.uuid.toLowerCase() === BLE_UART_CHAR
        );

        if (!uartChar) {
          throw new Error('Característica UART (FFE1) no trobada.');
        }

        addLog(`Connected to ${deviceName}`);
        setDevice(discovered);
        setIsConnected(true);

        // Comença a escoltar notificacions
        startReading(discovered);

        // Detecta desconnexions
        disconnectSubRef.current = bleManager.onDeviceDisconnected(
          selectedDevice.id,
          () => {
            addLog('Device disconnected');
            setDevice(null);
            setIsConnected(false);
            setIsMachineOn(false);
            stopReading();
            Alert.alert('Connexió perduda', "S'ha perdut la connexió amb el dispositiu");
          }
        );

        return true;
      } catch (error: any) {
        const message = error?.message || String(error);
        addLog(`Connection error: ${message}`);
        Alert.alert(
          'Error de connexió',
          `No s'ha pogut connectar amb ${deviceName}.\n\n` +
          'Verifica que:\n' +
          '• El mòdul BLE està encès (LED parpellejant)\n' +
          '• No hi ha cap altra app connectada\n' +
          '• Estàs a prop del dispositiu'
        );
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [addLog, startReading, stopReading]
  );

  const disconnectDevice = useCallback(async () => {
    stopReading();

    if (disconnectSubRef.current) {
      disconnectSubRef.current.remove();
      disconnectSubRef.current = null;
    }

    if (device) {
      try {
        await bleManager.cancelDeviceConnection(device.id);
        addLog('Disconnected');
      } catch (error: any) {
        addLog(`Disconnect error: ${error?.message || String(error)}`);
      }
      setDevice(null);
      setIsConnected(false);
      setIsMachineOn(false);
    }
  }, [device, addLog, stopReading]);

  const toggleMachine = useCallback(
    (on: boolean) => {
      const cmd = buildPowerCommand(on);
      sendCommand(cmd);
      setIsMachineOn(on);
    },
    [sendCommand]
  );

  const updateAngleH = useCallback((value: number) => { setAngleH(value); }, []);
  const updateAngleV = useCallback((value: number) => { setAngleV(value); }, []);
  const updateSpeed = useCallback((value: number) => { setSpeed(value); }, []);
  const updateEffect = useCallback((newEffect: EffectType) => { setEffect(newEffect); }, []);

  const sendAngleH = useCallback(
    (value: number) => { sendCommand(buildAngleHCommand(value)); },
    [sendCommand]
  );

  const sendAngleV = useCallback(
    (value: number) => { sendCommand(buildAngleVCommand(value)); },
    [sendCommand]
  );

  const sendSpeed = useCallback(
    (value: number) => { sendCommand(buildSpeedCommand(value)); },
    [sendCommand]
  );

  const sendEffect = useCallback(
    (eff: EffectType) => { sendCommand(buildEffectCommand(eff)); },
    [sendCommand]
  );

  const sendShot = useCallback(
    (shot: string) => { sendCommand(buildShotCommand(shot as any)); },
    [sendCommand]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopReading();
      if (disconnectSubRef.current) {
        disconnectSubRef.current.remove();
      }
    };
  }, [stopReading]);

  const value: BluetoothState = {
    device,
    isConnected,
    isConnecting,
    isMachineOn,
    angleH,
    angleV,
    speed,
    effect,
    logs,
    sendCommand,
    addLog,
    clearLogs,
    connectDevice,
    disconnectDevice,
    toggleMachine,
    updateAngleH,
    updateAngleV,
    updateSpeed,
    updateEffect,
    sendAngleH,
    sendAngleV,
    sendSpeed,
    sendEffect,
    sendShot,
  };

  return (
    <BluetoothContext.Provider value={value}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = (): BluetoothState => {
  const context = useContext(BluetoothContext);

  if (!context) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }

  return context;
};

/**
 * Escaneja dispositius BLE propers durant el temps especificat.
 * Retorna una llista de dispositius trobats amb nom.
 */
export const scanBLEDevices = async (timeoutMs: number = 5000): Promise<Device[]> => {
  try {
    const hasPermissions = await requestBluetoothPermissions();
    if (!hasPermissions) {
      console.error('Bluetooth permissions not granted');
      return [];
    }

    const state = await bleManager.state();
    if (state !== State.PoweredOn) {
      console.error('Bluetooth is not powered on');
      return [];
    }

    const devices: Device[] = [];

    return new Promise((resolve) => {
      bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, scannedDevice) => {
        if (error) {
          console.error('Scan error:', error);
          bleManager.stopDeviceScan();
          resolve(devices);
          return;
        }

        if (scannedDevice && scannedDevice.name) {
          // Afegeix només dispositius amb nom i sense duplicats
          if (!devices.find(d => d.id === scannedDevice.id)) {
            devices.push(scannedDevice);
          }
        }
      });

      setTimeout(() => {
        bleManager.stopDeviceScan();
        resolve(devices);
      }, timeoutMs);
    });
  } catch (error) {
    console.error('Error scanning BLE devices:', error);
    return [];
  }
};

/**
 * Comprova si el Bluetooth està activat.
 */
export const isBluetoothEnabled = async (): Promise<boolean> => {
  try {
    const state = await bleManager.state();
    return state === State.PoweredOn;
  } catch (error) {
    console.error('Error checking Bluetooth:', error);
    return false;
  }
};