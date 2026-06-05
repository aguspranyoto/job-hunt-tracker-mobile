import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Job, JobStatus, CreateJobInput } from "../lib/types";

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: CreateJobInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

const STATUS_OPTIONS = Object.values(JobStatus);

export default function JobForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}: JobFormProps) {
  const [company, setCompany] = useState(initialData?.company || "");
  const [position, setPosition] = useState(initialData?.position || "");
  const [status, setStatus] = useState<JobStatus>(
    initialData?.status || JobStatus.Bookmarked
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [salary, setSalary] = useState(initialData?.salary || "");
  const [dateApplied, setDateApplied] = useState(initialData?.dateApplied || "");
  const [jobUrl, setJobUrl] = useState(initialData?.jobUrl || "");
  const [benefits, setBenefits] = useState(initialData?.benefits || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [formError, setFormError] = useState("");
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    if (error) setFormError(error);
  }, [error]);

  const validate = (): boolean => {
    if (!company.trim()) {
      setFormError("Company name is required");
      return false;
    }
    if (!position.trim()) {
      setFormError("Position is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!validate()) return;

    await onSubmit({
      company: company.trim(),
      position: position.trim(),
      status,
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      dateApplied: dateApplied.trim() || undefined,
      jobUrl: jobUrl.trim() || undefined,
      benefits: benefits.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        {/* Company Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Company Name *
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
            placeholder="e.g. Acme Corp"
            placeholderTextColor="#737373"
            value={company}
            onChangeText={setCompany}
            editable={!isLoading}
          />
        </View>

        {/* Position */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Position *
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
            placeholder="e.g. Senior Frontend Developer"
            placeholderTextColor="#737373"
            value={position}
            onChangeText={setPosition}
            editable={!isLoading}
          />
        </View>

        {/* Status */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Status *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {STATUS_OPTIONS.map((s) => {
              const isSelected = s === status;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    isSelected
                      ? "bg-foreground dark:bg-white"
                      : "bg-muted dark:bg-[#262626] border border-border dark:border-[#262626]"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? "text-primary-foreground dark:text-[#0a0a0a]"
                        : "text-foreground dark:text-white"
                    }`}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Location */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Location
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
            placeholder="e.g. San Francisco, CA (Remote)"
            placeholderTextColor="#737373"
            value={location}
            onChangeText={setLocation}
            editable={!isLoading}
          />
        </View>

        {/* Salary */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Salary
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
            placeholder="e.g. $120,000 - $150,000"
            placeholderTextColor="#737373"
            value={salary}
            onChangeText={setSalary}
            editable={!isLoading}
          />
        </View>

        {/* Date Applied */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Date Applied
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#737373"
            value={dateApplied}
            onChangeText={setDateApplied}
            editable={!isLoading}
          />
        </View>

        {/* Job URL */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Job URL
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a]"
            placeholder="https://example.com/job"
            placeholderTextColor="#737373"
            value={jobUrl}
            onChangeText={setJobUrl}
            editable={!isLoading}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Benefits */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Benefits
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a] min-h-[80px]"
            placeholder="Health insurance, equity, remote, etc."
            placeholderTextColor="#737373"
            value={benefits}
            onChangeText={setBenefits}
            multiline
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground dark:text-white mb-1.5">
            Notes
          </Text>
          <TextInput
            className="border border-input dark:border-[#262626] rounded-xl px-4 py-3 text-foreground dark:text-white bg-white dark:bg-[#1a1a1a] min-h-[80px]"
            placeholder="Any additional notes..."
            placeholderTextColor="#737373"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Error */}
        {formError !== "" && (
          <View className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-[#7f1d1d] border border-red-200 dark:border-red-800">
            <Text className="text-red-600 dark:text-red-300 text-sm">{formError}</Text>
          </View>
        )}

        {/* Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            onPress={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-border dark:border-[#262626] items-center"
          >
            <Text className="text-foreground dark:text-white font-medium">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-foreground dark:bg-white items-center"
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="#fafafa"
              />
            ) : (
              <Text className="text-primary-foreground dark:text-[#0a0a0a] font-medium">
                {initialData ? "Update" : "Add Job"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
