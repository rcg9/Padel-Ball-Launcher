import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Device } from 'react-native-ble-plx';
import { useBluetooth, scanBLEDevices, isBluetoothEnabled } from '../hooks/useBluetooth';

const theme = {
  background: '#F0F2F5',
  surface: '#FFFFFF',
  primary: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

const Screen1_Connexio: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    isMachineOn,
    toggleMachine,
    connectDevice,
    disconnectDevice,
    logs,
    addLog,
  } = useBluetooth();

  const [foundDevices, setFoundDevices] = useState<Device[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [btEnabled, setBtEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    checkBluetooth();
  }, []);

  const checkBluetooth = async () => {
    const enabled = await isBluetoothEnabled();
    setBtEnabled(enabled);
    if (!enabled) {
      Alert.alert(
        'Bluetooth desactivat',
        'Activa el Bluetooth per connectar-te al dispositiu'
      );
    }
  };

  const scanDevices = async () => {
    const enabled = await isBluetoothEnabled();
    if (!enabled) {
      Alert.alert('Bluetooth desactivat', 'Activa el Bluetooth primer');
      return;
    }

    setIsScanning(true);
    setFoundDevices([]);
    setShowDeviceModal(true);
    addLog('Scanning BLE devices (5s)...');
    const devices = await scanBLEDevices(5000);
    setFoundDevices(devices);
    setIsScanning(false);
    addLog(`Found ${devices.length} BLE devices`);
  };

  const handleDeviceSelect = async (selectedDevice: Device) => {
    setShowDeviceModal(false);
    addLog(`Selected: ${selectedDevice.name || selectedDevice.id}`);
    await connectDevice(selectedDevice);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Desconnectar',
      'Vols desconnectar el dispositiu?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desconnectar', style: 'destructive', onPress: disconnectDevice },
      ]
    );
  };

  const renderConnectionStatus = () => {
    if (isConnecting) {
      return (
        <View style={styles.statusContainer}>
          <View style={[styles.statusCircle, styles.statusConnecting]} />
          <Text style={styles.statusText}>CONNECTANT...</Text>
        </View>
      );
    }

    if (isConnected) {
      return (
        <View style={styles.statusContainer}>
          <View style={[styles.statusCircle, styles.statusConnected]} />
          <Text style={styles.statusText}>
            CONNECTAT – {isMachineOn ? 'MÀQUINA ENGEGADA' : 'MÀQUINA PARADA'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusCircle, styles.statusDisconnected]} />
        <Text style={styles.statusText}>DESCONNECTAT</Text>
      </View>
    );
  };

  const renderDeviceModal = () => (
    <Modal
      visible={showDeviceModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDeviceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Dispositius BLE propers</Text>
          {isScanning ? (
            <View style={{ alignItems: 'center', padding: 30 }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.noDevicesText, { marginTop: 15 }]}>
                Escanejant dispositius BLE...
              </Text>
            </View>
          ) : foundDevices.length === 0 ? (
            <Text style={styles.noDevicesText}>
              No s'han trobat dispositius BLE propers
            </Text>
          ) : (
            <FlatList
              data={foundDevices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => handleDeviceSelect(item)}
                >
                  <Text style={styles.deviceName}>
                    {item.name || 'Dispositiu desconegut'}
                  </Text>
                  <Text style={styles.deviceAddress}>{item.id}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowDeviceModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel·lar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderLogs = () => (
    <Modal
      visible={showLogs}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLogs(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Log de comunicació</Text>
          <ScrollView style={styles.logsContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowLogs(false)}
          >
            <Text style={styles.modalCloseText}>Tancar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Control Pàdel</Text>
        {renderConnectionStatus()}
      </View>

      <View style={styles.buttonContainer}>
        {!isConnected ? (
          <TouchableOpacity
            style={[styles.button, styles.scanButton]}
            onPress={scanDevices}
            disabled={!btEnabled}
          >
            <Text style={styles.buttonIcon}>🔍</Text>
            <Text style={styles.buttonText}>ESCANEJAR DISPOSITIUS</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={handleDisconnect}
          >
            <Text style={styles.buttonIcon}>⏹</Text>
            <Text style={styles.buttonText}>DESCONNECTAR</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            isMachineOn ? styles.stopButton : styles.powerButton,
            !isConnected && styles.buttonDisabled,
          ]}
          onPress={() => toggleMachine(!isMachineOn)}
          disabled={!isConnected}
        >
          <Text style={styles.buttonIcon}>{isMachineOn ? '⏹' : '▶'}</Text>
          <Text style={styles.buttonText}>
            {isMachineOn ? 'PARAR MÀQUINA' : 'ENGEGAR MÀQUINA'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logsToggle}
        onPress={() => setShowLogs(true)}
      >
        <Text style={styles.logsToggleText}>📋 Veure log de comunicació</Text>
      </TouchableOpacity>

      {renderDeviceModal()}
      {renderLogs()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.surface,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  statusConnected: {
    backgroundColor: theme.primary,
  },
  statusDisconnected: {
    backgroundColor: theme.danger,
  },
  statusConnecting: {
    backgroundColor: theme.warning,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
  },
  scanButton: {
    backgroundColor: theme.primary,
  },
  disconnectButton: {
    backgroundColor: theme.textSecondary,
  },
  powerButton: {
    backgroundColor: theme.primary,
  },
  stopButton: {
    backgroundColor: theme.danger,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logsToggle: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    backgroundColor: theme.surface,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  logsToggleText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  noDevicesText: {
    color: theme.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  deviceAddress: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: theme.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  logsContainer: {
    maxHeight: 300,
  },
  logText: {
    fontSize: 12,
    color: theme.primary,
    fontFamily: 'monospace',
    paddingVertical: 4,
  },
});

export default Screen1_Connexio;