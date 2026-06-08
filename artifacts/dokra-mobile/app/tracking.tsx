import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { colors } from '../src/core/theme/colors';

export default function TrackingScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFinish = () => {
    // In real app, save to API and DB
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mock Map Area */}
      <View style={styles.mapArea}>
        <Text style={styles.mapPlaceholderText}>[ Google Maps Live Tracking ]</Text>
      </View>

      {/* Tracking Stats */}
      <View style={styles.statsPanel}>
        <Text style={styles.activityType}>{type === 'cycle' ? 'Cycling' : type === 'run' ? 'Running' : 'Walking'}</Text>
        
        <Text style={styles.timeDisplay}>{formatTime(seconds)}</Text>
        
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>1.24</Text>
            <Text style={styles.metricLabel}>Kilometers</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>6'32"</Text>
            <Text style={styles.metricLabel}>Avg Pace</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>86</Text>
            <Text style={styles.metricLabel}>Calories</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <Pressable style={[styles.controlBtn, isPaused ? styles.resumeBtn : styles.pauseBtn]} onPress={() => setIsPaused(!isPaused)}>
            <Text style={styles.controlText}>{isPaused ? 'RESUME' : 'PAUSE'}</Text>
          </Pressable>
          <Pressable style={[styles.controlBtn, styles.finishBtn]} onPress={handleFinish}>
            <Text style={styles.controlText}>FINISH</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E5EA' },
  mapArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapPlaceholderText: { color: '#666666', fontSize: 16, fontWeight: 'bold' },
  statsPanel: { backgroundColor: colors.light.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  activityType: { fontSize: 16, color: colors.light.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  timeDisplay: { fontSize: 64, fontWeight: 'bold', color: colors.light.text, marginBottom: 32, fontVariant: ['tabular-nums'] },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  metric: { alignItems: 'center', flex: 1 },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: colors.light.text, marginBottom: 4 },
  metricLabel: { fontSize: 12, color: colors.light.textSecondary, textTransform: 'uppercase' },
  controlsRow: { flexDirection: 'row', gap: 16, width: '100%' },
  controlBtn: { flex: 1, paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  pauseBtn: { backgroundColor: '#FF9500' },
  resumeBtn: { backgroundColor: colors.light.primary },
  finishBtn: { backgroundColor: '#FF3B30' },
  controlText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});
