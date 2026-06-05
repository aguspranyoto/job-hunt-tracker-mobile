import React from "react";
import { View, Text } from "react-native";
import { STAT_CARD_COLORS, STAT_CARD_BG_COLORS } from "../lib/constants";

interface StatsCardsProps {
  total: number;
  activePipeline: number;
  thisWeek: number;
  offers: number;
}

export default function StatsCards({
  total,
  activePipeline,
  thisWeek,
  offers,
}: StatsCardsProps) {
  const cards = [
    {
      label: "Total Applications",
      value: total,
      key: "total",
      icon: "📋",
    },
    {
      label: "Active Pipeline",
      value: activePipeline,
      key: "pipeline",
      icon: "🔄",
    },
    {
      label: "This Week",
      value: thisWeek,
      key: "week",
      icon: "📅",
    },
    {
      label: "Offers",
      value: offers,
      key: "offers",
      icon: "🎉",
    },
  ];

  return (
    <View className="flex-row flex-wrap px-4 pt-4 pb-2">
      {cards.map((card) => (
        <View
          key={card.key}
          className="w-[48%] mb-2 mx-[1%] rounded-xl p-4"
          style={{
            backgroundColor: STAT_CARD_BG_COLORS[card.key],
          }}
        >
          <Text className="text-2xl mb-1">{card.icon}</Text>
          <Text className="text-3xl font-bold text-foreground dark:text-white mt-1">
            {card.value}
          </Text>
          <Text
            className="text-sm font-medium mt-1"
            style={{ color: STAT_CARD_COLORS[card.key] }}
          >
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
