import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../lib/api";
import { Job, JobStatus } from "../../../lib/types";
import { JOB_STATUS_COLORS, JOB_STATUS_BG_COLORS } from "../../../lib/constants";
import DeleteDialog from "../../../components/DeleteDialog";
import { useState } from "react";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const {
    data: job,
    isLoading,
    error,
    refetch,
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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const result = await api.deleteJob(id!);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.back();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  const handleOpenUrl = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open URL");
    }
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background dark:bg-[#0a0a0a]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#0a0a0a" />
        <Text className="mt-2 text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background dark:bg-[#0a0a0a] px-8"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-lg font-bold text-foreground dark:text-white mb-2">
          Job not found
        </Text>
        <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3] text-center mb-4">
          {error?.message || "The backend API is not available."}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="px-6 py-3 rounded-xl bg-foreground dark:bg-white"
        >
          <Text className="text-primary-foreground dark:text-[#0a0a0a] font-medium">
            Retry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 mt-3 rounded-xl border border-border dark:border-[#262626]"
        >
          <Text className="text-foreground dark:text-white font-medium">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = JOB_STATUS_COLORS[job.status as JobStatus] || "#71717a";
  const statusBgColor = JOB_STATUS_BG_COLORS[job.status as JobStatus] || "#f4f4f5";

  return (
    <View
      className="flex-1 bg-background dark:bg-[#0a0a0a]"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-border dark:border-[#262626]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
          >
            <Text className="text-foreground dark:text-white text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground dark:text-white flex-1" numberOfLines={1}>
            {job.position}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/job/${id}/edit`)}
            className="px-4 py-2 rounded-xl bg-muted dark:bg-[#262626]"
          >
            <Text className="text-foreground dark:text-white text-sm font-medium">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeleteDialogVisible(true)}
            className="px-4 py-2 rounded-xl bg-red-50 dark:bg-[#7f1d1d]"
          >
            <Text className="text-red-600 dark:text-red-300 text-sm font-medium">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Company + Status */}
        <View className="py-6">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-xl bg-muted dark:bg-[#262626] items-center justify-center mr-3">
              <Text className="text-lg">🏢</Text>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground dark:text-white">
                {job.position}
              </Text>
              <Text className="text-base text-muted-foreground dark:text-[#a3a3a3]">
                {job.company}
              </Text>
            </View>
          </View>
          <View className="flex-row mt-3">
            <View
              className="px-4 py-1.5 rounded-full"
              style={{ backgroundColor: statusBgColor }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: statusColor }}
              >
                {job.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta Grid */}
        <View className="bg-card dark:bg-[#1a1a1a] rounded-2xl border border-border dark:border-[#262626] overflow-hidden mb-4">
          {/* Location */}
          {job.location && (
            <View className="flex-row items-center px-5 py-4 border-b border-border dark:border-[#262626]">
              <Text className="text-base mr-3">📍</Text>
              <View>
                <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">Location</Text>
                <Text className="text-sm text-foreground dark:text-white font-medium">{job.location}</Text>
              </View>
            </View>
          )}

          {/* Salary */}
          {job.salary && (
            <View className="flex-row items-center px-5 py-4 border-b border-border dark:border-[#262626]">
              <Text className="text-base mr-3">💰</Text>
              <View>
                <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">Salary</Text>
                <Text className="text-sm text-foreground dark:text-white font-medium">{job.salary}</Text>
              </View>
            </View>
          )}

          {/* Date Applied */}
          <View className="flex-row items-center px-5 py-4 border-b border-border dark:border-[#262626]">
            <Text className="text-base mr-3">📅</Text>
            <View>
              <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">Date Applied</Text>
              <Text className="text-sm text-foreground dark:text-white font-medium">
                {job.dateApplied ? formatDate(job.dateApplied) : "Not set"}
              </Text>
            </View>
          </View>

          {/* Last Updated */}
          <View className="flex-row items-center px-5 py-4">
            <Text className="text-base mr-3">🔄</Text>
            <View>
              <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">Last Updated</Text>
              <Text className="text-sm text-foreground dark:text-white font-medium">
                {formatDateTime(job.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* View Job Posting */}
        {job.jobUrl && (
          <TouchableOpacity
            onPress={() => handleOpenUrl(job.jobUrl!)}
            className="flex-row items-center justify-center px-5 py-4 mb-4 rounded-2xl bg-muted dark:bg-[#262626] border border-border dark:border-[#262626]"
          >
            <Text className="text-base mr-2">🔗</Text>
            <Text className="text-foreground dark:text-white font-medium text-sm">
              View Job Posting
            </Text>
          </TouchableOpacity>
        )}

        {/* Benefits */}
        {job.benefits && (
          <View className="mb-4 p-5 rounded-2xl bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#262626]">
            <Text className="text-sm font-bold text-foreground dark:text-white mb-2">
              Benefits
            </Text>
            <View className="flex-row flex-wrap">
              {job.benefits.split("\n").map((line: string, i: number) => (
                line.trim() ? (
                  <View key={i} className="flex-row items-start mb-1.5 mr-4">
                    <Text className="text-muted-foreground mr-2">•</Text>
                    <Text className="text-sm text-foreground dark:text-white flex-1">{line.trim()}</Text>
                  </View>
                ) : null
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {job.notes && (
          <View className="mb-6 p-5 rounded-2xl bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#262626]">
            <Text className="text-sm font-bold text-foreground dark:text-white mb-2">
              Notes
            </Text>
            <Text className="text-sm text-foreground dark:text-white leading-5">
              {job.notes}
            </Text>
          </View>
        )}

        {/* Created/Updated timestamps */}
        <View className="mb-8 px-1">
          <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">
            Created: {formatDateTime(job.createdAt)}
          </Text>
          <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3] mt-0.5">
            Updated: {formatDateTime(job.updatedAt)}
          </Text>
        </View>
      </ScrollView>

      {/* Delete Dialog */}
      <DeleteDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        jobTitle={job?.position}
      />
    </View>
  );
}
