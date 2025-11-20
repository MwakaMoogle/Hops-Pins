// app/components/CheckinHistory.tsx
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

interface Checkin {
  id: string;
  drink: string;
  rating: number;
  note?: string;
  createdAt: any; // Firestore Timestamp
  userName?: string;
}

interface CheckinHistoryProps {
  checkins: Checkin[];
  pubId: string;
}

const CheckinHistory: React.FC<CheckinHistoryProps> = ({ checkins, pubId }) => {
  if (checkins.length === 0) {
    return (
      <View className="bg-gray-50 rounded-xl p-5">
        <Text className="text-lg font-bold text-gray-800 mb-2">Recent Check-ins</Text>
        <Text className="text-gray-500 text-center py-4">
          No check-ins yet. Be the first to check in!
        </Text>
      </View>
    );
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="bg-white border border-gray-200 rounded-xl p-5">
      <Text className="text-lg font-bold text-gray-800 mb-3">
        Recent Check-ins ({checkins.length})
      </Text>
      <ScrollView>
        {checkins.slice(0, 10).map((checkin, index) => (
          <View 
            key={checkin.id} 
            className={`p-3 rounded-lg ${
              index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
            } ${index < checkins.length - 1 ? 'mb-2' : ''}`}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-medium text-gray-800">{checkin.drink}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-yellow-500 mr-1">⭐</Text>
                  <Text className="text-gray-600 text-sm">{checkin.rating}/5</Text>
                  {checkin.note && (
                    <Text className="text-gray-500 text-sm ml-2">• {checkin.note}</Text>
                  )}
                </View>
              </View>
              <Text className="text-gray-400 text-xs">
                {formatTime(checkin.createdAt)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CheckinHistory;