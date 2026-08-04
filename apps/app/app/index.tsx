import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth";

export default function Index() {
  const { loading, session } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Redirect
      href={session ? "/(app)" : "/(auth)/login"}
    />
  );
}