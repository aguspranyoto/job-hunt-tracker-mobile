import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as api from "../../lib/api";
import { CreateJobInput } from "../../lib/types";
import JobForm from "../../components/JobForm";

export default function AddJobScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const mutation = useMutation({
    mutationFn: async (input: CreateJobInput) => {
      const result = await api.createJob(input);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.back();
    },
    onError: (err: Error) => {
      // Error is shown in JobForm via mutation.error
    },
  });

  const handleSubmit = async (data: CreateJobInput) => {
    await mutation.mutateAsync(data);
  };

  return (
    <View
      className="flex-1 bg-background dark:bg-[#0a0a0a]"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-4 py-3 border-b border-border dark:border-[#262626]">
        <Text className="text-xl font-bold text-foreground dark:text-white">
          Add New Job
        </Text>
        <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3]">
          Track a new application
        </Text>
      </View>

      <JobForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={mutation.isPending}
        error={mutation.error?.message}
      />
    </View>
  );
}
