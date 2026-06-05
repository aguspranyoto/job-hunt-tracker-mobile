import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../../lib/api";
import { CreateJobInput, Job } from "../../../../lib/types";
import JobForm from "../../../../components/JobForm";

export default function EditJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const result = await api.fetchJob(id!);
      if (result.error) throw new Error(result.error);
      return result.data as Job;
    },
    enabled: !!id,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: async (input: CreateJobInput) => {
      const result = await api.updateJob(id!, input);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.back();
    },
  });

  if (jobLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background dark:bg-[#0a0a0a]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#0a0a0a" />
      </View>
    );
  }

  if (jobError || !job) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background dark:bg-[#0a0a0a] px-8"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-lg font-bold text-foreground dark:text-white mb-2">
          Job not found
        </Text>
        <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3] text-center mb-4">
          {jobError?.message || "Unable to load job data."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 rounded-xl border border-border dark:border-[#262626]"
        >
          <Text className="text-foreground dark:text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background dark:bg-[#0a0a0a]"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-4 py-3 border-b border-border dark:border-[#262626]">
        <Text className="text-xl font-bold text-foreground dark:text-white">
          Edit Job
        </Text>
        <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3]">
          {job.company} - {job.position}
        </Text>
      </View>

      <JobForm
        initialData={job}
        onSubmit={async (data: CreateJobInput) => {
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.back()}
        isLoading={mutation.isPending}
        error={mutation.error?.message}
      />
    </View>
  );
}
