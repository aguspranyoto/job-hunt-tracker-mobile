import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../lib/auth";
import { useRouter } from "expo-router";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-[#0a0a0a]">
        <ActivityIndicator size="large" color="#0a0a0a" />
        <Text className="mt-4 text-muted-foreground font-sans">Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    router.replace("/(auth)/login");
    return null;
  }

  return <>{children}</>;
}
