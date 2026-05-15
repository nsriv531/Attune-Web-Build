import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Platform,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { KeycapButton } from "@/components/KeycapSurface";
import { Colors, Typography, Spacing, Radius } from "@/constants/theme";

import { useAuthStore } from '@/backend/stores/authStore';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const setGuest = useAuthStore((s) => s.setGuest);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) return null;

  const handleGuestLogin = () => {
    setGuest(true);
    router.replace('/(tabs)');
  };

  const onSignUpPress = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo mark */}
        <View style={styles.logoRow}>
          <Text style={styles.logoEmoji}>〰️</Text>
          <Text style={styles.logoText}>Attune</Text>
        </View>

        <Text style={styles.title}>
          {pendingVerification ? "Verify Email" : "Create account"}
        </Text>
        <Text style={styles.subtitle}>
          {pendingVerification
            ? "We sent a verification code to your email."
            : "Start your focus journey today."}
        </Text>

        {error ? (
          <View style={styles.errorBadge}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!pendingVerification ? (
          <>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputKeycapDepth}>
              <View style={styles.inputKeycapFace}>
                <View style={styles.inputShine} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputKeycapDepth}>
              <View style={styles.inputKeycapFace}>
                <View style={styles.inputShine} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <KeycapButton
              accent
              radius={Radius.lg + 2}
              style={{ marginTop: 24 }}
              contentStyle={styles.btnFace}
              onPress={onSignUpPress}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#2C2000" />
                : <Text style={styles.btnText}>Sign Up</Text>}
            </KeycapButton>

            <Pressable onPress={() => router.push("/sign-in")} style={styles.linkRow}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={[styles.linkText, styles.linkAccent]}>Sign In</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <KeycapButton
              radius={Radius.lg + 2}
              contentStyle={styles.btnFace}
              onPress={handleGuestLogin}
              disabled={loading}
            >
              <Text style={[styles.btnText, { color: Colors.textSecondary }]}>Continue as Guest</Text>
            </KeycapButton>
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Verification Code</Text>
            <View style={styles.inputKeycapDepth}>
              <View style={styles.inputKeycapFace}>
                <View style={styles.inputShine} />
                <TextInput
                  style={styles.input}
                  placeholder="6-digit code"
                  placeholderTextColor={Colors.textTertiary}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <KeycapButton
              accent
              radius={Radius.lg + 2}
              style={{ marginTop: 24 }}
              contentStyle={styles.btnFace}
              onPress={onVerifyPress}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#2C2000" />
                : <Text style={styles.btnText}>Verify Email</Text>}
            </KeycapButton>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const inputDepthShadow = Platform.OS === 'ios'
  ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 }
  : { elevation: 1 };

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  logoEmoji: { fontSize: 22 },
  logoText: {
    fontFamily: Typography.fontSans,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  title: {
    fontFamily: Typography.fontSans,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
    lineHeight: 20,
  },

  errorBadge: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },

  fieldLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  inputKeycapDepth: {
    backgroundColor: Colors.keycapDepthColor,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 2,
    ...inputDepthShadow,
  },
  inputKeycapFace: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md - 1,
    overflow: 'hidden',
    position: 'relative',
  },
  inputShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.keycapHighlight,
    borderTopLeftRadius: Radius.md - 1,
    borderTopRightRadius: Radius.md - 1,
    zIndex: 1,
  },
  input: {
    fontFamily: Typography.fontSans,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  btnFace: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: Typography.fontSans,
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2000',
    letterSpacing: 0.2,
  },

  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  linkText: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkAccent: {
    color: Colors.amber,
    fontWeight: '700',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
