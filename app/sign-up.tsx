import { useState } from "react";
import { View, TextInput, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

import { useAuthStore } from '@/stores/authStore';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const setGuest = useAuthStore((s) => s.setGuest);

  // Form State
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
      console.error(JSON.stringify(err, null, 2));
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
      console.error(JSON.stringify(err, null, 2));
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
        /* Email/Password Form */
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Create a password"
            placeholderTextColor="#666"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={onSignUpPress}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push("/sign-in")} style={{ marginTop: 20 }}>
            <Text style={{ color: "#aaa", textAlign: "center" }}>Already have an account? Sign In</Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            <View>
              <Text style={{ width: 50, textAlign: 'center', color: '#666' }}>OR</Text>
            </View>
            <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#333', marginTop: 20 }]} 
            onPress={handleGuestLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* Email Verification Form */
        <>
          <Text style={styles.infoText}>We sent a verification code to {email}.</Text>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#666"
            keyboardType="number-pad"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={onVerifyPress}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify Email</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPendingVerification(false)} style={{ marginTop: 20 }}>
            <Text style={{ color: "#aaa", textAlign: "center" }}>Back to Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 30,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    color: "#ccc",
    marginBottom: 20,
  },
  errorText: {
    color: "#ff4444",
    marginBottom: 15,
    fontWeight: "500",
  },
  label: {
    color: "white",
    marginTop: 15,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: 15,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#312e81",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
