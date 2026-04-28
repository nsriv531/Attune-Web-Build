import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  
  // UI State
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) return null;

  // Step 1: Initial Sign In
  const handleSignIn = async () => {
  if (loading) return;
  setLoading(true);
  setError("");

  try {
    const result = await signIn.create({
      identifier: email,
      password,
    });

    // 1. Handle MFA (Second Factor)
    if (result.status === "needs_second_factor") {
      // Use ?? [] to ensure we don't call .find on null
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
    } 
    
    // 2. Handle Passwordless/First Factor code
    else if (result.status === "needs_first_factor") {
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
    } 
    
    else if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
    }
  } catch (err: any) {
    console.error("Sign-In Error:", JSON.stringify(err, null, 2));
    setError(err.errors?.[0]?.message || "An error occurred during sign in.");
  } finally {
    setLoading(false);
  }
};

  // Step 2: Verify 2FA Code
  const handleVerify2FA = async () => {
  if (loading) return;
  setLoading(true);
  setError("");

  try {
    let result;

    // We must call the method that matches the current status of the sign-in
    if (signIn.status === "needs_second_factor") {
      console.log("Verifying Second Factor (MFA)...");
      result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });
    } else {
      console.log("Verifying First Factor (Passwordless)...");
      result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
    }

    if (result.status === "complete") {
      console.log("Sign-in complete!");
      await setActive({ session: result.createdSessionId });
    }
  } catch (err: any) {
    console.error("Verification Error:", JSON.stringify(err, null, 2));
    setError(err.errors?.[0]?.message || "Invalid verification code.");
  } finally {
    setLoading(false);
  }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pendingSecondFactor ? "Verify Identity" : "Sign In"}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!pendingSecondFactor ? (
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
            placeholder="Enter password"
            placeholderTextColor="#666"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push("/sign-up")} style={{ marginTop: 20 }}>
            <Text style={{ color: "#aaa", textAlign: "center" }}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* 2FA Verification Form */
        <>
          <Text style={styles.infoText}>We sent a verification code to your email.</Text>
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
            onPress={handleVerify2FA}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify Code</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPendingSecondFactor(false)} style={{ marginTop: 20 }}>
            <Text style={{ color: "#aaa", textAlign: "center" }}>Back to Sign In</Text>
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