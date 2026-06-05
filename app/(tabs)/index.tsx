import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../lib/api";
import { Job, JobStatus, DashboardStats } from "../../lib/types";
import StatsCards from "../../components/StatsCards";
import JobCard from "../../components/JobCard";
import DeleteDialog from "../../components/DeleteDialog";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  ...Object.values(JobStatus).map((s) => ({ label: s, value: s })),
];

const PAGE_SIZE = 10;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Stats query
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const result = await api.fetchStats();
      if (result.error) throw new Error(result.error);
      return result.data as DashboardStats;
    },
    retry: 1,
  });

  // Jobs query
  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["jobs", page, statusFilter, search],
    queryFn: async () => {
      const result = await api.fetchJobs(
        page,
        PAGE_SIZE,
        statusFilter || undefined,
        search || undefined
      );
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    retry: 1,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deleteJob(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setDeleteDialogVisible(false);
      setSelectedJob(null);
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  const handleDelete = useCallback(() => {
    if (selectedJob) {
      deleteMutation.mutate(selectedJob.id);
    }
  }, [selectedJob, deleteMutation]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/(auth)/login");
  }, [signOut, router]);

  const handleRefresh = useCallback(() => {
    refetchJobs();
    refetchStats();
  }, [refetchJobs, refetchStats]);

  const renderJobItem = useCallback(
    ({ item }: { item: Job }) => (
      <JobCard
        job={item}
        onView={() => router.push(`/(tabs)/job/${item.id}`)}
        onEdit={() => router.push(`/(tabs)/job/${item.id}/edit`)}
        onDelete={() => {
          setSelectedJob(item);
          setDeleteDialogVisible(true);
        }}
      />
    ),
    [router]
  );

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (jobsData && page < jobsData.totalPages) {
      setPage((p) => p + 1);
    }
  };

  // Determine if the API is not available (404 from API)
  const isApiError = jobsError || statsError;

  return (
    <View
      className="flex-1 bg-background dark:bg-[#0a0a0a]"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-border dark:border-[#262626]">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground dark:text-white">
            Job Hunt Tracker
          </Text>
          <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3]">
            {session?.user?.name || session?.user?.email || "User"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          className="px-4 py-2 rounded-xl bg-muted dark:bg-[#262626]"
        >
          <Text className="text-foreground dark:text-white text-sm font-medium">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* API Error Banner */}
      {isApiError && (
        <View className="mx-4 mt-3 p-3 rounded-xl bg-amber-50 dark:bg-[#713f12] border border-amber-200 dark:border-amber-800 flex-row items-center justify-between">
          <Text className="text-amber-700 dark:text-amber-200 text-sm flex-1">
            Backend API not ready. Showing demo data.
          </Text>
          <TouchableOpacity onPress={handleRefresh} className="ml-2 px-3 py-1 rounded-lg bg-amber-200 dark:bg-amber-700">
            <Text className="text-amber-800 dark:text-amber-200 text-xs font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats */}
      <StatsCards
        total={statsData?.total ?? 0}
        activePipeline={statsData?.activePipeline ?? 0}
        thisWeek={statsData?.thisWeek ?? 0}
        offers={statsData?.offers ?? 0}
      />

      {/* Search and Filter */}
      <View className="px-4 py-2">
        <View className="flex-row gap-2">
          <View className="flex-1 border border-input dark:border-[#262626] rounded-xl bg-white dark:bg-[#1a1a1a] flex-row items-center px-3">
            <Text className="text-muted-foreground mr-2">🔍</Text>
            <TextInput
              className="flex-1 py-3 text-foreground dark:text-white text-sm"
              placeholder="Search jobs..."
              placeholderTextColor="#737373"
              value={search}
              onChangeText={(t) => { setSearch(t); setPage(1); }}
            />
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/add")}
            className="px-4 py-3 rounded-xl bg-foreground dark:bg-white items-center justify-center"
          >
            <Text className="text-primary-foreground dark:text-[#0a0a0a] text-sm font-medium">
              + Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filter Pills */}
      <View className="px-4 pb-1">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isActive = statusFilter === item.value;
            return (
              <TouchableOpacity
                onPress={() => { setStatusFilter(item.value); setPage(1); }}
                className={`px-4 py-2 rounded-full mr-2 ${
                  isActive
                    ? "bg-foreground dark:bg-white"
                    : "bg-muted dark:bg-[#262626] border border-border dark:border-[#262626]"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isActive
                      ? "text-primary-foreground dark:text-[#0a0a0a]"
                      : "text-foreground dark:text-white"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Job List */}
      {jobsLoading ? (
        <View className="flex-1 items-center justify-center px-4">
          <ActivityIndicator size="large" color="#0a0a0a" />
          <Text className="mt-2 text-muted-foreground text-sm">Loading jobs...</Text>
        </View>
      ) : jobsData && jobsData.data.length > 0 ? (
        <FlatList
          className="flex-1 mt-1"
          data={jobsData.data}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} />
          }
          ListFooterComponent={
            jobsData.totalPages > 1 ? (
              <View className="flex-row justify-center items-center py-4 gap-4">
                <TouchableOpacity
                  onPress={handlePrevPage}
                  disabled={page <= 1}
                  className={`px-4 py-2 rounded-xl ${
                    page <= 1
                      ? "bg-muted dark:bg-[#262626] opacity-50"
                      : "bg-foreground dark:bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      page <= 1
                        ? "text-muted-foreground"
                        : "text-primary-foreground dark:text-[#0a0a0a]"
                    }`}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm text-muted-foreground">
                  Page {page} of {jobsData.totalPages}
                </Text>
                <TouchableOpacity
                  onPress={handleNextPage}
                  disabled={page >= jobsData.totalPages}
                  className={`px-4 py-2 rounded-xl ${
                    page >= jobsData.totalPages
                      ? "bg-muted dark:bg-[#262626] opacity-50"
                      : "bg-foreground dark:bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      page >= jobsData.totalPages
                        ? "text-muted-foreground"
                        : "text-primary-foreground dark:text-[#0a0a0a]"
                    }`}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📋</Text>
          <Text className="text-lg font-bold text-foreground dark:text-white mb-1">
            No jobs tracked yet
          </Text>
          <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3] text-center mb-6">
            Start tracking your job applications by adding your first job.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/add")}
            className="px-6 py-3 rounded-xl bg-foreground dark:bg-white"
          >
            <Text className="text-primary-foreground dark:text-[#0a0a0a] font-medium">
              Add your first job
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        visible={deleteDialogVisible}
        onClose={() => {
          setDeleteDialogVisible(false);
          setSelectedJob(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        jobTitle={selectedJob?.position}
      />
    </View>
  );
}
