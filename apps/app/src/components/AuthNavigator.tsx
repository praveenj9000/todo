import { Redirect, useSegments } from "expo-router";
import { useAuth } from "@todo/auth";
import { LoadingScreen } from "./LoadingScreen";

type Props = {
    children: React.ReactNode;
};

export function AuthNavigator({
    children,
}: Props) {
    const { session, loading } = useAuth();

    const segments = useSegments();

    if (loading) {
        return <LoadingScreen />;
    }

    const inPublic =
        segments[0] === "(public)";

    if (!session && !inPublic) {
        return <Redirect href="/login" />;
    }

    if (session && inPublic) {
        return <Redirect href="/" />;
    }

    return children;
}