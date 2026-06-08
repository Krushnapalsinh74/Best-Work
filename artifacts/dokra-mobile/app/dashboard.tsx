import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/core/theme/colors';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.name}>Runner!</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 5 Day Streak</Text>
          </View>
        </View>

        {/* Today's Stats */}
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.2</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>320</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>45m</Text>
            <Text style={styles.statLabel}>Active Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5,240</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
        </View>

        {/* Quick Start */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickStartContainer}>
          <Pressable style={styles.quickStartCard} onPress={() => router.push('/tracking?type=run')}>
            <Text style={styles.quickStartEmoji}>🏃</Text>
            <Text style={styles.quickStartText}>Run</Text>
          </Pressable>
          <Pressable style={styles.quickStartCard} onPress={() => router.push('/tracking?type=walk')}>
            <Text style={styles.quickStartEmoji}>🚶</Text>
            <Text style={styles.quickStartText}>Walk</Text>
          </Pressable>
          <Pressable style={styles.quickStartCard} onPress={() => router.push('/tracking?type=cycle')}>
            <Text style={styles.quickStartEmoji}>🚴</Text>
            <Text style={styles.quickStartText}>Cycle</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, marginTop: 10 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5E5EA' },
  greeting: { fontSize: 14, color: colors.light.textSecondary },
  name: { fontSize: 20, fontWeight: 'bold', color: colors.light.text },
  streakBadge: { backgroundColor: '#FFF0ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  streakText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.light.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  statCard: { width: '48%', backgroundColor: '#F2F2F7', padding: 16, borderRadius: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: colors.light.primary, marginBottom: 4 },
  statLabel: { fontSize: 14, color: colors.light.textSecondary },
  quickStartContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  quickStartCard: { backgroundColor: '#F2F2F7', width: '31%', paddingVertical: 24, borderRadius: 16, alignItems: 'center' },
  quickStartEmoji: { fontSize: 32, marginBottom: 8 },
  quickStartText: { fontSize: 16, fontWeight: '600', color: colors.light.text }
});
