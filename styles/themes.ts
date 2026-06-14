export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  subText: string;
  success: string;
  danger: string;
  border: string;
  accent: string;
  overlay: string;
  white: string;
};

export const LightTheme: ThemeColors = {
  primary: "#ff6b00",
  secondary: "#ffa559",
  background: "#ffffff",
  card: "#f5f5f5",
  text: "#222222",
  subText: "#777777",
  success: "#28a745",
  danger: "#ff3b30",
  border: "#dddddd",
  accent: "#fff6ed",
  overlay: "rgba(0,0,0,0.4)",
  white: "#ffffff",
};

export const DarkTheme: ThemeColors = {
  primary: "#ff8533",
  secondary: "#cc5500",
  background: "#121212",
  card: "#1e1e1e",
  text: "#f0f0f0",
  subText: "#aaaaaa",
  success: "#4caf50",
  danger: "#ff5252",
  border: "#333333",
  accent: "#2a1a0e",
  overlay: "rgba(0,0,0,0.7)",
  white: "#ffffff",
};
