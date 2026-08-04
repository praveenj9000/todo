import { useState } from "react";
import { Button, Input, Text, YStack } from "tamagui";
import { register } from "../../src/services/auth";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await register(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack
      flex={1}
      justifyContent="center"
      padding="$4"
      gap="$4"
    >
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? "Creating account..." : "Register"}
      </Button>

      {error ? (
        <Text color="$red10">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}