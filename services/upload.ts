import { supabase } from "./supabaseClient";
import * as ImagePicker from "expo-image-picker";

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Camera roll permission is required to upload photos");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

export async function uploadAvatar(uri: string, userId: string): Promise<string> {
  const ext = uri.split(".").pop() || "jpg";
  const fileName = `avatars/${userId}_${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from("avatars").upload(fileName, blob, {
    contentType: `image/${ext === "png" ? "png" : "jpeg"}`,
    upsert: true,
  });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return urlData.publicUrl;
}
