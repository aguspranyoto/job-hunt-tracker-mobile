import React, { useEffect } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Text, View, ActivityIndicator, useColorScheme } from "react-native";
import { useAuth } from "../../lib/auth";

function AuthCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-[#0a0a0a]">
        <ActivityIndicator size="large" color="#0a0a0a" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default function TabsLayout() {
  const systemScheme = useColorScheme();
  const isDark = systemScheme === "dark";

  return (
    <AuthCheck>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: isDark ? "#ffffff" : "#0a0a0a",
          tabBarInactiveTintColor: "#737373",
          tabBarStyle: {
            backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
            borderTopColor: isDark ? "#262626" : "#e5e5e5",
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>📊</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add Job",
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>➕</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="job/[id]"
          options={{
            href: null,
            title: "Job Detail",
          }}
        />
        <Tabs.Screen
          name="job/[id]/edit"
          options={{
            href: null,
            title: "Edit Job",
          }}
        />
      </Tabs>
    </AuthCheck>
  );
}
