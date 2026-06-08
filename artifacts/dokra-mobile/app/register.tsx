import { View, Text, StyleSheet, Pressable, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/core/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join DOKRA Running Club</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={styles.input} placeholder="+91 9876543210" keyboardType="phone-pad" />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} placeholder="175" keyboardType="numeric" />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput style={styles.input} placeholder="70" keyboardType="numeric" />
            </View>
          </View>

          <Pressable style={styles.button} onPress={() => router.replace('/dashboard')}>
            <Text style={styles.buttonText}>Register & Continue</Text>
          </Pressable>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  scrollContent: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 32, marginTop: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.light.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.light.textSecondary },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: colors.light.text },
  input: { borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#FAFAFA' },
  button: { backgroundColor: colors.light.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: colors.light.textSecondary, fontSize: 16 },
  loginText: { color: colors.light.primary, fontSize: 16, fontWeight: 'bold' }
});
