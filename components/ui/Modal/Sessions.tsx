import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

interface SessionsProps {
  onClose: () => void;
}

export const Sessions: React.FC<SessionsProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select(
            "device_name,ip_address,user_agent,last_active_at,revoked_at"
          );

        if (error) {
          console.error("Failed to fetch sessions:", error);
          return;
        }

        setSessions(data || []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    fetchSessions();
  }, []);

  return (
    <View className="absolute bg-white w-full z-20 bottom-0 rounded-t-lg h-3/4">
      <View className="rounded-t-lg bg-[#EBEBEB] flex flex-row justify-between py-4 px-6 items-center">
        <View className="flex-1">
          <Pressable onPress={onClose}>
            <ThemedText fontSize={14} className="text-[#0099FF]">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <View className="flex-1 items-center">
          <ThemedText fontSize={14} fontWeight={700}>
            Sessions
          </ThemedText>
        </View>
        <View className="flex-1" />
      </View>

      <ScrollView>
        <View className="mx-6">
          <Spacer size={20} />

          <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-2">
            {sessions.map((session, index) => (
              <View key={index} className="flex flex-row gap-2">
                <Spacer size={16} />
                <View
                  className={`w-2 h-2 mt-1 rounded-full ${
                    session.revoked_at &&
                    session.revoked_at > session.last_active_at
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                />
                <View>
                  <ThemedText fontWeight={700} fontSize={14}>
                    {session.device_name}{" "}
                    <ThemedText fontSize={14}>
                      ({session.ip_address})
                    </ThemedText>
                  </ThemedText>
                  <Spacer size={4} />
                  <ThemedText fontSize={12}>{session.user_agent}</ThemedText>
                  <Spacer size={4} />
                  {session.revoked_at &&
                  session.revoked_at > session.last_active_at ? (
                    <ThemedText fontSize={12}>
                      Revoked at {formatDate(session.revoked_at)}
                    </ThemedText>
                  ) : (
                    <ThemedText fontSize={12}>
                      Last active at {formatDate(session.last_active_at)}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
          <Spacer size={20} />
        </View>
      </ScrollView>
    </View>
  );
};
