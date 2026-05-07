import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useAuthStore } from '@/stores/authStore';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const setGuest = useAuthStore((s) => s.setGuest);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // UI State
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
    <View style={styles.container}>
      <Text style={styles.title}>{pendingVerification ? "Verify Email" : "Sign Up"}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!pendingVerification ? (
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/sign-in")} style={{ marginTop: 20 }}>
            <Text style={{ color: "#6B5C43", textAlign: "center" }}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* Email Verification Form */
        <>
          <Text style={styles.infoText}>We sent a verification code to your email.</Text>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#666"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onVerifyPress}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.buttonText}>Verify Email</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    padding: 30,
  },
  title: {
    color: "#2D261A",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    color: "#6B5C43",
    marginBottom: 20,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 15,
    fontWeight: "500",
  },
  label: {
    color: "#2D261A",
    marginTop: 15,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#2D261A",
    padding: 15,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5D9C5",
  },
  button: {
    backgroundColor: "#FDBA31",
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#FCE7AD",
  },
  buttonText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
  },
});