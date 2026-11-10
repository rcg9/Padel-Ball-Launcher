import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useBluetooth } from '../hooks/useBluetooth';
import { EffectType } from '../hooks/useBluetooth';

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

const Screen2_Parametres: React.FC = () => {
  const {
    isConnected,
    angleH,
    angleV,
    speed,
    effect,
    updateAngleH,
    updateAngleV,
    updateSpeed,
    updateEffect,
    sendAngleH,
    sendAngleV,
    sendSpeed,
    sendEffect,
  } = useBluetooth();

  const [localAngleH, setLocalAngleH] = useState(angleH);
  const [localAngleV, setLocalAngleV] = useState(angleV);
  const [localSpeed, setLocalSpeed] = useState(speed);

  // Sincronitza l'estat local quan s'actualitza l'estat global (ex: rebuda de dades per Bluetooth)
  useEffect(() => {
    setLocalAngleH(angleH);
  }, [angleH]);

  useEffect(() => {
    setLocalAngleV(angleV);
  }, [angleV]);

  useEffect(() => {
    setLocalSpeed(speed);
  }, [speed]);

  const handleAngleHChange = (value: number) => {
    setLocalAngleH(Math.round(value));
  };

  const handleAngleVChange = (value: number) => {
    setLocalAngleV(Math.round(value));
  };

  const handleSpeedChange = (value: number) => {
    setLocalSpeed(Math.round(value));
  };

  const handleAngleHComplete = (value: number) => {
    const rounded = Math.round(value);
    updateAngleH(rounded);
    sendAngleH(rounded);
  };

  const handleAngleVComplete = (value: number) => {
    const rounded = Math.round(value);
    updateAngleV(rounded);
    sendAngleV(rounded);
  };

  const handleSpeedComplete = (value: number) => {
    const rounded = Math.round(value);
    updateSpeed(rounded);
    sendSpeed(rounded);
  };

  const handleEffectSelect = (eff: EffectType) => {
    updateEffect(eff);
    sendEffect(eff);
  };

  const renderEffectButton = (
    label: string,
    effectValue: EffectType,
    icon: string
  ) => {
    const isActive = effect === effectValue;
    return (
      <TouchableOpacity
        style={[
          styles.effectButton,
          isActive && styles.effectButtonActive,
          !isConnected && styles.buttonDisabled,
        ]}
        onPress={() => handleEffectSelect(effectValue)}
        disabled={!isConnected}
      >
        <Text style={styles.effectIcon}>{icon}</Text>
        <Text
          style={[
            styles.effectLabel,
            isActive && styles.effectLabelActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const disabled = !isConnected;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paràmetres</Text>
        {disabled && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Connecta't primer a la pantalla 1
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={[styles.sliderContainer, disabled && styles.disabledContainer]}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>↔ Rotació Horitzontal</Text>
            <Text style={styles.sliderValue}>{localAngleH}°</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={180}
            value={localAngleH}
            onValueChange={handleAngleHChange}
            onSlidingComplete={handleAngleHComplete}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.primary}
            disabled={disabled}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>0°</Text>
            <Text style={styles.rangeText}>90°</Text>
            <Text style={styles.rangeText}>180°</Text>
          </View>
        </View>

        <View style={[styles.sliderContainer, disabled && styles.disabledContainer]}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>↕ Inclinació Vertical</Text>
            <Text style={styles.sliderValue}>{localAngleV}°</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={90}
            value={localAngleV}
            onValueChange={handleAngleVChange}
            onSlidingComplete={handleAngleVComplete}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.primary}
            disabled={disabled}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>0°</Text>
            <Text style={styles.rangeText}>45°</Text>
            <Text style={styles.rangeText}>90°</Text>
          </View>
        </View>

        <View style={[styles.sliderContainer, disabled && styles.disabledContainer]}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>⚡ Velocitat de Llançament</Text>
            <Text style={styles.sliderValue}>{localSpeed}%</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={localSpeed}
            onValueChange={handleSpeedChange}
            onSlidingComplete={handleSpeedComplete}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.primary}
            disabled={disabled}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>0%</Text>
            <Text style={styles.rangeText}>50%</Text>
            <Text style={styles.rangeText}>100%</Text>
          </View>
        </View>

        <View style={[styles.effectContainer, disabled && styles.disabledContainer]}>
          <Text style={styles.effectTitle}>Efecte de la pilota</Text>
          <View style={styles.effectButtons}>
            {renderEffectButton('TOP SPIN', 'TS', '🔼')}
            {renderEffectButton('NORMAL', 'NR', '➡')}
            {renderEffectButton('TALLAT', 'CU', '🔽')}
          </View>
        </View>
      </View>
    </View>
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
  content: {
    padding: 20,
    gap: 25,
  },
  sliderContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledContainer: {
    opacity: 0.4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  effectContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  effectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  effectButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  effectButton: {
    flex: 1,
    backgroundColor: theme.border,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  effectButtonActive: {
    backgroundColor: theme.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  effectIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  effectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  effectLabelActive: {
    color: '#FFFFFF',
  },
});

export default Screen2_Parametres;