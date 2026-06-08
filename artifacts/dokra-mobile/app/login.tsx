import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/core/theme/colors';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to track your activities</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, styles.googleButton]}>
            <Text style={styles.googleButtonText}>Continue With Google</Text>
          </Pressable>

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Continue With Mobile OTP</Text>
          </Pressable>

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Continue With Email</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 48 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.light.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.light.textSecondary },
  buttonContainer: { gap: 16 },
  button: { backgroundColor: colors.light.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  googleButton: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E5E5EA' },
  googleButtonText: { color: colors.light.text, fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 48 },
  footerText: { color: colors.light.textSecondary, fontSize: 16 },
  registerText: { color: colors.light.primary, fontSize: 16, fontWeight: 'bold' }
});
