import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function demanderPermissionNotifications() {
  const { status: statutExistant } = await Notifications.getPermissionsAsync();
  let statutFinal = statutExistant;
  if (statutExistant !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    statutFinal = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Radio Notre-Dame de Bangui",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return statutFinal === "granted";
}
