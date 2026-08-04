import { useState } from "react";
import { Button, Input, Text, YStack } from "tamagui";
import { login } from "../api/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const { error } = await login(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack
      gap="$4"
      width="100%"
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
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Login"}
      </Button>

      {error ? (
        <Text color="$red10">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}