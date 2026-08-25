import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const ADMIN_URL = "https://4dinsight-deeeyrxh.manus.space/admin";

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // The remote workspace may keep its document load open while long-lived
    // requests complete. Never block the visible WebView indefinitely.
    const failSafe = setTimeout(() => setLoading(false), 4500);
    return () => clearTimeout(failSafe);
  }, []);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 4500);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#070b15" />
      <View style={styles.container}>
        {!failed ? (
          <WebView
            ref={webViewRef}
            source={{ uri: ADMIN_URL }}
            originWhitelist={["https://*", "http://*"]}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            pullToRefreshEnabled
            allowsBackForwardNavigationGestures
            onLoadProgress={({ nativeEvent }) => {
              if (nativeEvent.progress >= 0.55) setLoading(false);
            }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onHttpError={() => {
              setLoading(false);
              setFailed(true);
            }}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
          />
        ) : (
          <View style={styles.errorState}>
            <Text style={styles.eyebrow}>NEW4D ADMIN</Text>
            <Text style={styles.heading}>Unable to reach the workspace</Text>
            <Text style={styles.body}>
              Check your internet connection, then retry the secure admin workspace.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={retry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>Retry connection</Text>
            </Pressable>
          </View>
        )}
        {loading && !failed ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#e5b643" />
            <Text style={styles.loadingText}>Opening admin workspace</Text>
            <Text style={styles.loadingHint}>This will continue in the background.</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#070b15" },
  container: { flex: 1, backgroundColor: "#070b15" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: "#070b15",
  },
  loadingText: {
    color: "#f7f1df",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  loadingHint: {
    color: "#8791a6",
    fontSize: 13,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  eyebrow: {
    color: "#e5b643",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    marginBottom: 18,
  },
  heading: {
    color: "#f7f1df",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.7,
    lineHeight: 39,
  },
  body: {
    color: "#bac2d4",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#e5b643",
    borderRadius: 8,
    marginTop: 26,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  retryText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
