import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { getSessions, revokeSession } from "@/lib/supabase/database";
import { formatDate } from "@/lib/utils";
import { SessionsRow } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { ScrollView, View, Platform } from "react-native";
import { ModalHeader } from "../ModalHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { useAlert } from "@/contexts/AlertProvider";
import { webStorage } from "@/lib/largeSecureStore";
import * as Device from "expo-device";

interface SessionModalProps {
  onClose: () => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<Partial<SessionsRow>[]>([]);
  const [revoking, setRevoking] = useState<Set<string>>(new Set());
  const [showRevokedSessions, setShowRevokedSessions] =
    useState<boolean>(false);
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const currentDeviceId =
    Platform.OS === "web" ? webStorage.getItem("device_id") : Device.osBuildId;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    fetchSessions();
  }, []);

  const handleRevokeSession = async (
    sessionDeviceId: string,
    deviceName: string
  ) => {
    if (!user?.id) return;

    showAlert(
      "Revoke Session",
      `Are you sure you want to revoke the session for "${deviceName}"? This will sign out this device immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            setRevoking((prev) => new Set(prev).add(sessionDeviceId));

            try {
              await revokeSession(user.id, sessionDeviceId);

              // Refresh sessions list
              const data = await getSessions();
              setSessions(data);
            } catch (error) {
              console.error("Failed to revoke session:", error);
              showAlert("Error", "Failed to revoke session. Please try again.");
            } finally {
              setRevoking((prev) => {
                const newSet = new Set(prev);
                newSet.delete(sessionDeviceId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View
      className={`flex-1 w-full rounded-t-lg bg-white ${
        Platform.OS === "web" && "max-w-2xl mx-auto"
      }`}
    >
      <ModalHeader title="Sessions" onClose={onClose} />

      <ScrollView>
        <View className="mx-6 my-5">
          <ThemedText fontSize={14} className="text-gray-600 flex-1">
            Manage your active sessions. You can revoke sessions from other
            devices to secure your account.
          </ThemedText>

          <Spacer size={8} />

          <Button
            text={showRevokedSessions ? "Hide Revoked" : "Show Revoked"}
            type="secondary-rounded"
            size="small"
            onPress={() => setShowRevokedSessions(!showRevokedSessions)}
          />

          <Spacer size={16} />

          <View className="bg-[#EBEBEB] px-4 py-4 rounded-lg gap-4">
            {(() => {
              const filteredSessions = showRevokedSessions
                ? sessions
                : sessions.filter((session) => {
                    const isRevoked =
                      session.revoked_at &&
                      session.last_active_at &&
                      session.revoked_at > session.last_active_at;
                    return !isRevoked;
                  });

              return filteredSessions.length === 0 ? (
                <View className="py-4">
                  <ThemedText
                    fontSize={14}
                    className="text-center text-gray-500"
                  >
                    {showRevokedSessions
                      ? "No sessions found"
                      : "No active sessions found"}
                  </ThemedText>
                </View>
              ) : (
                filteredSessions.map((session, index) => {
                  const isRevoked =
                    session.revoked_at &&
                    session.last_active_at &&
                    session.revoked_at > session.last_active_at;
                  const isCurrentDevice =
                    session.device_id && session.device_id === currentDeviceId;
                  const isRevoking = session.device_id
                    ? revoking.has(session.device_id)
                    : false;

                  return (
                    <View key={index} className="gap-2">
                      <View className="flex flex-row gap-2">
                        <Spacer size={16} />
                        <View
                          className={`w-2 h-2 mt-1 rounded-full ${
                            isRevoked ? "bg-red-500" : "bg-green-500"
                          }`}
                        />
                        <View className="flex-1">
                          <View className="flex flex-row items-center justify-between">
                            <View className="flex-1">
                              <ThemedText fontWeight={700} fontSize={14}>
                                {session.device_name}
                                {isCurrentDevice && (
                                  <ThemedText
                                    fontSize={12}
                                    className="text-green-600"
                                  >
                                    {" "}
                                    (This device)
                                  </ThemedText>
                                )}{" "}
                                <ThemedText fontSize={14}>
                                  ({session.ip_address})
                                </ThemedText>
                              </ThemedText>
                              <Spacer size={4} />
                              <ThemedText fontSize={12}>
                                {session.user_agent}
                              </ThemedText>
                              <Spacer size={4} />
                              {isRevoked ? (
                                <ThemedText fontSize={12}>
                                  Revoked at{" "}
                                  {session.revoked_at
                                    ? formatDate(session.revoked_at)
                                    : "Unknown"}
                                </ThemedText>
                              ) : (
                                <ThemedText fontSize={12}>
                                  Last active at{" "}
                                  {formatDate(session.last_active_at!)}
                                </ThemedText>
                              )}
                            </View>

                            {!isRevoked && !isCurrentDevice && (
                              <Button
                                text={isRevoking ? "Revoking..." : "Revoke"}
                                type="danger-rounded"
                                size="small"
                                disabled={isRevoking}
                                onPress={() =>
                                  session.device_id &&
                                  handleRevokeSession(
                                    session.device_id,
                                    session.device_name || "Unknown Device"
                                  )
                                }
                              />
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              );
            })()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
