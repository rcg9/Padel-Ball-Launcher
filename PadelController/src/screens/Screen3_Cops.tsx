import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useBluetooth } from '../hooks/useBluetooth';

interface ShotButton {
  name: string;
  command: string;
  icon: string;
  flipIcon?: boolean;
}

const shots: ShotButton[] = [
  { name: 'Dreta', command: 'DR', icon: '➜' },
  { name: 'Revés', command: 'RV', icon: '➜', flipIcon: true },
  { name: 'Volea Dreta', command: 'VD', icon: '⚡➜' },
  { name: 'Volea Esquerra', command: 'VE', icon: '⚡➜', flipIcon: true },
  { name: 'Smash', command: 'SM', icon: '💥' },
  { name: 'Bandeja', command: 'BD', icon: '🎾' },
  { name: 'Baixada de Paret', command: 'BV', icon: '🧱🎾' },
];

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

const Screen3_Cops: React.FC = () => {
  const { isConnected, sendShot } = useBluetooth();
  const [activeShot, setActiveShot] = useState<string | null>(null);

  const handleShotPress = (shot: ShotButton) => {
    if (!isConnected) return;

    setActiveShot(shot.command);
    sendShot(shot.command);

    setTimeout(() => {
      setActiveShot(null);
    }, 200);
  };

  const disabled = !isConnected;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tipus de Cop</Text>
        {disabled && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Connecta&apos;t primer a la pantalla 1
            </Text>
          </View>
        )}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            La màquina ha d'estar centrada a la línia de saque del camp rival, al mig.
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.shotsGrid}>
          {shots.map((shot) => {
            const isActive = activeShot === shot.command;

            return (
              <TouchableOpacity
                key={shot.command}
                style={[
                  styles.shotButton,
                  isActive && styles.shotButtonActive,
                  disabled && styles.buttonDisabled,
                ]}
                onPress={() => handleShotPress(shot)}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.shotIcon,
                    shot.flipIcon && { transform: [{ rotateY: '180deg' }] }
                  ]}
                >
                  {shot.icon}
                </Text>

                <Text
                  style={[
                    styles.shotName,
                    isActive && styles.shotNameActive,
                  ]}
                >
                  {shot.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  warningBanner: {
    backgroundColor: theme.warning,
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  warningText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  content: {
    padding: 20,
  },
  shotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  shotButton: {
    width: '47%',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  shotButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    transform: [{ scale: 1.05 }],
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  shotIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: theme.text,
  },
  orangeIcon: {
    color: '#FF8C00',
  },
  shotName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
  },
  shotNameActive: {
    color: '#FFFFFF',
  },
});

export default Screen3_Cops;