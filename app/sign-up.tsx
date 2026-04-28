// app/sign-up.tsx
import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  if (!isLoaded) return null;

  const onSignUpPress = async () => {
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      {!pendingVerification ? (
        <>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Sign Up" onPress={onSignUpPress} />
        </>
      ) : (
        <>
          <TextInput placeholder="Verification Code" value={code} onChangeText={setCode} />
          <Button title="Verify Email" onPress={onVerifyPress} />
        </>
      )}
    </View>
  );
}