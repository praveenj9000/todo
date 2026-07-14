import { Redirect } from "expo-router";
import { useAuth } from "@todo/auth";
import { ActivityIndicator } from "react-native";

export function AuthGate({ children }: {
    children: React.ReactNode;
}) {

    const { session, loading } = useAuth();

    if (loading) {
        return (
            <ActivityIndicator />
        );
    }

    if (!session) {
        return (
            <Redirect href="/(auth)/login" />
        );
    }

    return children;
}