import * as Device from "expo-device";
import {
  AndroidImportance,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  EventSubscription,
  scheduleNotificationAsync,
  NotificationContentInput,
  NotificationRequestInput,
} from "expo-notifications";
import { Platform } from "react-native";

export type NotificationListener = (notification: any) => void;
export type NotificationResponseListener = (response: any) => void;

let receivedSubscription: EventSubscription | null = null;
let responseSubscription: EventSubscription | null = null;

export async function setupNotifications() {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await setNotificationChannelAsync("order-updates", {
      name: "Order Updates",
      importance: AndroidImportance.HIGH,
      description: "Notifications about your food orders",
    });
  }

  const permission = await getPermissionsAsync();
  const isGranted = "granted" in permission && permission.granted === true;

  if (!isGranted) {
    const result = await requestPermissionsAsync();
    const granted = "granted" in result && result.granted === true;
    if (!granted) {
      return null;
    }
  }

  const tokenData = await getExpoPushTokenAsync();
  return tokenData.data;
}

export function subscribeToNotifications(
  onReceived: NotificationListener,
  onResponse?: NotificationResponseListener,
) {
  receivedSubscription = addNotificationReceivedListener(onReceived);
  if (onResponse) {
    responseSubscription = addNotificationResponseReceivedListener(onResponse);
  }
}

export function unsubscribeFromNotifications() {
  if (receivedSubscription) {
    receivedSubscription.remove();
    receivedSubscription = null;
  }
  if (responseSubscription) {
    responseSubscription.remove();
    responseSubscription = null;
  }
}

export async function scheduleLocalNotification(
  content: NotificationContentInput,
  trigger?: NotificationRequestInput["trigger"],
) {
  await scheduleNotificationAsync({
    content: {
      sound: "default",
      ...content,
    },
    trigger: trigger || null,
  });
}
