import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const ADMIN_URL = "https://4dinsight-deeeyrxh.manus.space/admin";

type Screen = "launcher" | "workspace" | "unavailable";

export default function App() {
  const [screen, setScreen] = useState<Screen>("launcher");
  const [webViewKey, setWebViewKey] = useState(0);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  const openWorkspace = () => {
    setWorkspaceLoading(true);
    setWebViewKey(value => value + 1);
    setScreen("workspace");
  };

  const openBrowser = () => Linking.openURL(ADMIN_URL);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#070b15" />
      {screen === "launcher" ? (
        <View style={styles.launcher}>
          <Image source={require("./assets/splash-icon.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.eyebrow}>NEW4D · OWNER WORKSPACE</Text>
          <Text style={styles.heading}>Admin control, ready when you are.</Text>
          <Text style={styles.body}>
            Start the secure dashboard only when you choose. This keeps the app responsive even when the network is slow.
          </Text>
          <Pressable accessibilityRole="button" onPress={openWorkspace} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Open admin dashboard</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={openBrowser} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Open securely in browser</Text>
          </Pressable>
          <Text style={styles.footnote}>Internet access is required for live admin data.</Text>
        </View>
      ) : screen === "workspace" ? (
        <View style={styles.workspace}>
          <View style={styles.workspaceBar}>
            <Pressable accessibilityRole="button" onPress={() => setScreen("launcher")} style={styles.backButton}>
              <Text style={styles.backText}>‹ Back</Text>
            </Pressable>
            <Text style={styles.workspaceTitle}>NEW4D ADMIN</Text>
            {workspaceLoading ? <ActivityIndicator size="small" color="#e5b643" /> : <View style={styles.statusDot} />}
          </View>
          <WebView
            key={webViewKey}
            source={{ uri: ADMIN_URL }}
            originWhitelist={["https://*"]}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            pullToRefreshEnabled
            onLoadEnd={() => setWorkspaceLoading(false)}
            onLoadProgress={({ nativeEvent }) => {
              if (nativeEvent.progress >= 0.1) setWorkspaceLoading(false);
            }}
            onError={() => {
              setWorkspaceLoading(false);
              setScreen("unavailable");
            }}
            onHttpError={({ nativeEvent }) => {
              if (nativeEvent.url === ADMIN_URL && nativeEvent.statusCode >= 400) {
                setWorkspaceLoading(false);
                setScreen("unavailable");
              }
            }}
          />
        </View>
      ) : (
        <View style={styles.launcher}>
          <Text style={styles.eyebrow}>WORKSPACE UNAVAILABLE</Text>
          <Text style={styles.heading}>The dashboard could not be reached.</Text>
          <Text style={styles.body}>Your app is working. Check the connection, then retry inside the app or open the same secure dashboard in your browser.</Text>
          <Pressable accessibilityRole="button" onPress={openWorkspace} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Retry in app</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={openBrowser} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Open securely in browser</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#070b15" },
  launcher: { flex: 1, justifyContent: "center", paddingHorizontal: 30, backgroundColor: "#070b15" },
  logo: { alignSelf: "flex-start", height: 82, marginBottom: 30, width: 82 },
  eyebrow: { color: "#e5b643", fontSize: 12, fontWeight: "800", letterSpacing: 2.1, marginBottom: 16 },
  heading: { color: "#f7f1df", fontSize: 34, fontWeight: "700", letterSpacing: -0.9, lineHeight: 41 },
  body: { color: "#bac2d4", fontSize: 16, lineHeight: 25, marginTop: 15 },
  primaryButton: { alignSelf: "flex-start", backgroundColor: "#e5b643", borderRadius: 9, marginTop: 32, paddingHorizontal: 21, paddingVertical: 15 },
  primaryText: { color: "#121722", fontSize: 14, fontWeight: "800", letterSpacing: 0.3 },
  secondaryButton: { alignSelf: "flex-start", borderColor: "#3d475b", borderRadius: 9, borderWidth: 1, marginTop: 12, paddingHorizontal: 21, paddingVertical: 15 },
  secondaryText: { color: "#e5e9f4", fontSize: 14, fontWeight: "700" },
  footnote: { color: "#788196", fontSize: 12, lineHeight: 18, marginTop: 26 },
  workspace: { flex: 1, backgroundColor: "#070b15" },
  workspaceBar: { alignItems: "center", backgroundColor: "#0c1220", flexDirection: "row", height: 54, justifyContent: "space-between", paddingHorizontal: 16 },
  backButton: { paddingVertical: 8 },
  backText: { color: "#d7dcea", fontSize: 14, fontWeight: "700" },
  workspaceTitle: { color: "#e5b643", fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  statusDot: { backgroundColor: "#6ccf9b", borderRadius: 5, height: 9, width: 9 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
});
