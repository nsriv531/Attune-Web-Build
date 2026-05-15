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
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { KeycapButton } from "@/components/KeycapSurface";
import { Colors, Typography, Spacing, Radius } from "@/constants/theme";


import { useAuthStore } from '@/backend/stores/authStore';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const setGuest = useAuthStore((s) => s.setGuest);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) return null;

  const handleGuestLogin = () => {
    setGuest(true);
    router.replace('/(tabs)');
  };

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "needs_second_factor") {
        const secondFactor = (result.supportedSecondFactors ?? []).find(
          (f) => f.strategy === "email_code"
        );
        if (secondFactor && "emailAddressId" in secondFactor) {
          setPendingSecondFactor(true);
          await result.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: secondFactor.emailAddressId,
          });
        }
      } else if (result.status === "needs_first_factor") {
        const firstFactor = (result.supportedFirstFactors ?? []).find(
          (f) => f.strategy === "email_code"
        );
        if (firstFactor && "emailAddressId" in firstFactor) {
          setPendingSecondFactor(true);
          await result.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: firstFactor.emailAddressId,
          });
        }
      } else if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };


  const handleVerify2FA = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      let result;
      if (signIn.status === "needs_second_factor") {
        result = await signIn.attemptSecondFactor({ strategy: "email_code", code });
      } else {
        result = await signIn.attemptFirstFactor({ strategy: "email_code", code });
      }
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      }
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
          {pendingSecondFactor ? "Verify Identity" : "Welcome back"}
        </Text>
        <Text style={styles.subtitle}>
          {pendingSecondFactor
            ? "We sent a code to your email."
            : "Sign in to continue your focus practice."}
        </Text>

        {error ? (
          <View style={styles.errorBadge}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!pendingSecondFactor ? (
          <>
            {/* Email field */}
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputKeycapDepth}>
              <View style={styles.inputKeycapFace}>
                <View style={styles.inputShine} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password field */}
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputKeycapDepth}>
              <View style={styles.inputKeycapFace}>
                <View style={styles.inputShine} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>

            {/* Sign In button */}
            <KeycapButton
              accent
              radius={Radius.lg + 2}
              style={{ marginTop: 24 }}
              contentStyle={styles.btnFace}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#2C2000" />
                : <Text style={styles.btnText}>Sign In</Text>}
            </KeycapButton>

            {/* Sign up link */}
            <Pressable onPress={() => router.push("/sign-up")} style={styles.linkRow}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={[styles.linkText, styles.linkAccent]}>Sign Up</Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest button */}
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
            {/* Verification code field */}
            <Text style={styles.fieldLabel}>Verification Code</Text>
            <View style={styles.inputKeycapDepth}>
              <View style={styles.inputKeycapFace}>
                <View style={styles.inputShine} />
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="6-digit code"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <KeycapButton
              accent
              radius={Radius.lg + 2}
              style={{ marginTop: 24 }}
              contentStyle={styles.btnFace}
              onPress={handleVerify2FA}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#2C2000" />
                : <Text style={styles.btnText}>Verify Code</Text>}
            </KeycapButton>

            <Pressable onPress={() => setPendingSecondFactor(false)} style={styles.linkRow}>
              <Text style={[styles.linkText, { color: Colors.textTertiary }]}>← Back to Sign In</Text>
            </Pressable>
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

  // Keycap input field
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
