export type EffectType = 'TS' | 'NR' | 'CU';
export type ShotType = 'GL' | 'DR' | 'RV' | 'VD' | 'VE' | 'SM' | 'BD' | 'RP' | 'BV';

export interface BluetoothState {
  device: any | null;
  isConnected: boolean;
  isConnecting: boolean;
  isMachineOn: boolean;
  angleH: number;
  angleV: number;
  speed: number;
  effect: EffectType;
  logs: string[];
  sendCommand: (cmd: string) => void;
  addLog: (message: string) => void;
  clearLogs: () => void;
  connectDevice: (device: any) => Promise<boolean>;
  disconnectDevice: () => Promise<void>;
  toggleMachine: (on: boolean) => void;
  updateAngleH: (value: number) => void;
  updateAngleV: (value: number) => void;
  updateSpeed: (value: number) => void;
  updateEffect: (effect: EffectType) => void;
  sendAngleH: (value: number) => void;
  sendAngleV: (value: number) => void;
  sendSpeed: (value: number) => void;
  sendEffect: (effect: EffectType) => void;
  sendShot: (shot: string) => void;
}

export const formatAngle = (value: number): string => {
  return value.toString().padStart(3, '0');
};

export const formatSpeed = (value: number): string => {
  return value.toString().padStart(3, '0');
};

export const buildAngleHCommand = (angle: number): string => {
  return `H:${formatAngle(Math.round(angle))}\n`;
};

export const buildAngleVCommand = (angle: number): string => {
  return `V:${formatAngle(Math.round(angle))}\n`;
};

export const buildSpeedCommand = (speed: number): string => {
  return `S:${formatSpeed(Math.round(speed))}\n`;
};

export const buildEffectCommand = (effect: EffectType): string => {
  return `EF:${effect}\n`;
};

export const buildShotCommand = (shot: ShotType): string => {
  return `COP:${shot}\n`;
};

export const buildPowerCommand = (on: boolean): string => {
  return `PWR:${on ? 'ON' : 'OFF'}\n`;
};