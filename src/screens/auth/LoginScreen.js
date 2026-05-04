import {
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// 1. Point to the new image in your assets folder
const backgroundImage = require("../assets/images/blurred_background.png");

const LoginScreen = ({ navigation }) => {
  return (
    // 2. Wrap the entire screen content in ImageBackground
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      {/* 3. Add a semi-transparent overlay to ensure text contrast */}
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.logoText}>GoGourmet</Text>
          <Text style={styles.subtitle}>Fresh food delivered to you.</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#888" // Good for visibility
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Fill the whole screen
  background: { flex: 1 },
  // Optional: darkens or softens the image to help white elements pop
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
  },
  // Keep the padding for the content
  contentContainer: { padding: 20 },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D2D2D",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: {
    marginTop: 20,
    textAlign: "center",
    color: "#4CAF50",
    fontWeight: "600",
  },
});

export default LoginScreen;
