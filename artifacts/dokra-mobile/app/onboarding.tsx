import { View, Text, StyleSheet, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../src/core/theme/colors';

const { width } = Dimensions.get('window');

const ONBOARDING_PAGES = [
  { title: 'Track Every Step', subtitle: 'Keep a record of every walk, run, and ride.' },
  { title: 'Compete Across India', subtitle: 'Join city vs city battles and national leaderboards.' },
  { title: 'Earn Badges & Medals', subtitle: 'Unlock achievements for your fitness milestones.' },
  { title: 'Join DOKRA Community', subtitle: 'Connect with friends and fitness enthusiasts.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Placeholder for Illustration */}
        <View style={styles.imagePlaceholder} />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{ONBOARDING_PAGES[currentPage].title}</Text>
          <Text style={styles.subtitle}>{ONBOARDING_PAGES[currentPage].subtitle}</Text>
        </View>

        <View style={styles.pagination}>
          {ONBOARDING_PAGES.map((_, index) => (
            <View 
              key={index} 
              style={[styles.dot, currentPage === index && styles.activeDot]} 
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Pressable onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentPage === ONBOARDING_PAGES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  imagePlaceholder: { width: width * 0.8, height: width * 0.8, backgroundColor: '#f0f0f0', borderRadius: 20, marginBottom: 40 },
  textContainer: { alignItems: 'center', minHeight: 100 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.light.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.light.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  pagination: { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA' },
  activeDot: { width: 24, backgroundColor: colors.light.primary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, paddingBottom: 40 },
  skipButton: { padding: 16, width: 100, alignItems: 'center' },
  skipText: { fontSize: 16, color: colors.light.textSecondary, fontWeight: '600' },
  nextButton: { backgroundColor: colors.light.primary, padding: 16, borderRadius: 30, width: 160, alignItems: 'center' },
  nextText: { fontSize: 16, color: '#fff', fontWeight: 'bold' }
});
