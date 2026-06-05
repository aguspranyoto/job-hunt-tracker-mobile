import React from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native";

interface DeleteDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  jobTitle?: string;
}

export default function DeleteDialog({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  jobTitle,
}: DeleteDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-border dark:border-[#262626]">
          <Text className="text-xl font-bold text-foreground dark:text-white mb-2">
            Delete Application
          </Text>
          <Text className="text-muted-foreground dark:text-[#a3a3a3] mb-6 leading-5">
            {jobTitle
              ? `Are you sure you want to delete "${jobTitle}"? This cannot be undone.`
              : "Are you sure you want to delete this application? This cannot be undone."}
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl border border-border dark:border-[#262626] items-center"
            >
              <Text className="text-foreground dark:text-white font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-destructive items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-destructive-foreground font-medium">Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
