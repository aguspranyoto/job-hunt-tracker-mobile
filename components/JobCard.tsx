import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Job, JobStatus } from "../lib/types";
import { JOB_STATUS_COLORS, JOB_STATUS_BG_COLORS } from "../lib/constants";

interface JobCardProps {
  job: Job;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function JobCard({ job, onView, onEdit, onDelete }: JobCardProps) {
  const statusColor = JOB_STATUS_COLORS[job.status];
  const statusBgColor = JOB_STATUS_BG_COLORS[job.status];

  return (
    <TouchableOpacity
      onPress={onView}
      className="mx-4 my-1.5 rounded-xl border border-border dark:border-[#262626] bg-card dark:bg-[#1a1a1a] overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-foreground dark:text-white">
              {job.position}
            </Text>
            <Text className="text-sm text-muted-foreground dark:text-[#a3a3a3] mt-0.5">
              {job.company}
            </Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: statusBgColor }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusColor }}
            >
              {job.status}
            </Text>
          </View>
        </View>

        {(job.location || job.salary) && (
          <View className="flex-row mt-3 gap-3">
            {job.location && (
              <View className="flex-row items-center">
                <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">
                  📍 {job.location}
                </Text>
              </View>
            )}
            {job.salary && (
              <View className="flex-row items-center">
                <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">
                  💰 {job.salary}
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-border dark:border-[#262626]">
          <Text className="text-xs text-muted-foreground dark:text-[#a3a3a3]">
            {job.dateApplied ? `Applied: ${formatDate(job.dateApplied)}` : formatDate(job.createdAt)}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={onEdit}
              className="px-3 py-1 rounded-md bg-muted dark:bg-[#262626]"
            >
              <Text className="text-xs text-foreground dark:text-white">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="px-3 py-1 rounded-md bg-red-50 dark:bg-[#7f1d1d]"
            >
              <Text className="text-xs text-red-600 dark:text-red-300">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
