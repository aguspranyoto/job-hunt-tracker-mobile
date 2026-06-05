import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (!isLogin && !name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = isLogin
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name.trim());

      if (result.error) {
        setError(result.error);
      }
      // If successful, isAuthenticated will be true and useEffect will redirect
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Dark mode background - use a dark gradient view covering full screen
  const BackgroundGradient = () => (
    <View className="absolute inset-0 bg-white dark:bg-[#0a0a0a]" />
  );

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <ActivityIndicator size="large" color="#0a0a0a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: "#ffffff" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 min-h-full relative bg-background dark:bg-[#0a0a0a]">
          {/* Card positioned in center */}
          <View className="flex-1 justify-center px-6 py-8">
            <View
              className="w-full rounded-2xl p-8 border border-border dark:border-[#262626]"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
  
              }}
            >
              {/* Briefcase Icon */}
              <View className="items-center mb-6">
                <View className="w-16 h-16 rounded-2xl bg-foreground dark:bg-white items-center justify-center mb-4">
                  <Text className="text-3xl">💼</Text>
                </View>
                <Text className="text-2xl font-bold text-foreground dark:text-white text-center">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </Text>
                <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3] text-center mt-1">
                  {isLogin
                    ? "Sign in to your Job Hunt Tracker"
                    : "Create your Job Hunt Tracker account"}
                </Text>
              </View>

              {/* Name field (register only) */}
              {!isLogin && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
                    Name
                  </Text>
                  <TextInput
                    className="border border-input dark:border-[#262626] rounded-xl px-4 py-3.5 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
                    placeholder="Your name"
                    placeholderTextColor="#737373"
                    value={name}
                    onChangeText={setName}
                    editable={!isLoading}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
                  Email
                </Text>
                <TextInput
                  className="border border-input dark:border-[#262626] rounded-xl px-4 py-3.5 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
                  placeholder="you@example.com"
                  placeholderTextColor="#737373"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              {/* Password */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
                  Password
                </Text>
                <View className="relative flex-row items-center border border-input dark:border-[#262626] rounded-xl bg-white dark:bg-[#1a1a1a]">
                  <TextInput
                    className="flex-1 px-4 py-3.5 text-foreground dark:text-white"
                    placeholder="Enter your password"
                    placeholderTextColor="#737373"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="px-4 py-3.5"
                  >
                    <Text className="text-muted-foreground dark:text-[#a3a3a3] text-sm">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error message */}
              {error !== "" && (
                <View className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-[#7f1d1d] border border-red-200 dark:border-red-800">
                  <Text className="text-red-600 dark:text-red-300 text-sm">{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-foreground dark:bg-white items-center mt-4"
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#fafafa"
                  />
                ) : (
                  <Text className="text-primary-foreground dark:text-[#0a0a0a] font-semibold text-base">
                    {isLogin ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3]">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </Text>
                <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(""); }}>
                  <Text className="text-sm font-medium text-foreground dark:text-white ml-1">
                    {isLogin ? "Create Account" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
