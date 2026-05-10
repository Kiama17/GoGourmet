import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/avatar.png")}
          style={styles.avatar}
        />

        <Text style={styles.name}>Kiama</Text>

        <Text style={styles.email}>nyaruaimaina17@gmail.com</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Delivery Addresses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Payment Methods</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    backgroundColor: "#ff6b00",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },

  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  email: {
    fontSize: 16,
    color: "#fff",
    marginTop: 5,
  },

  menu: {
    padding: 20,
  },

  menuItem: {
    backgroundColor: "#f5f5f5",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },

  menuText: {
    fontSize: 18,
    fontWeight: "500",
  },

  logoutButton: {
    backgroundColor: "#ff3b30",
    padding: 18,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
