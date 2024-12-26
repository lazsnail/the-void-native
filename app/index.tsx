// App.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
} from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { LinearGradient } from "expo-linear-gradient";
import SpinningStars from "./stars";

// Types
interface VoidMessage {
  id: string;
  content: string;
  created_at: string;
}

interface AsyncStorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const colors: [string, string, string][] = [
  ["#9C27B0", "#673AB7", "#3F51B5"],
  ["black", "black", "black"],
];

const SpinningCircle = (size: number, variant: number) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotation = Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(rotation, {
      iterations: -1, // -1 means infinite
    }).start();

    return () => {
      spinValue.setValue(0);
    };
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: "50%",
          left: "50%",
          marginLeft: (size / 2) * -1,
          marginTop: (size / 2) * -1,
          width: size,
          height: size,
        },
        {
          transform: [{ rotate }],
        },
      ]}
    >
      <LinearGradient
        colors={colors[variant]}
        style={styles.circle as ViewStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}; // Environment variables
const supabaseUrl: string = "https://gtewhvrbsmaxhlcbgkyu.supabase.co";
const supabaseKey: string = process.env.EXPO_PUBLIC_SUPABASE_KEY || "";

// Custom storage implementation for React Native
const ExpoAsyncStorageStub: AsyncStorageInterface = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Error setting item:", e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing item:", e);
    }
  },
};

// Initialize Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoAsyncStorageStub,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [receivedMessage, setReceivedMessage] = useState<string>("");
  const [viewMessage, setViewMessage] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<boolean>(false);

  const [containerHeight] = useState(new Animated.Value(350)); // Adjust initial height as needed

  // Add this useEffect to handle the animation
  useEffect(() => {
    Animated.timing(containerHeight, {
      toValue: viewMessage ? 0 : 200, // Adjust target heights as needed
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [viewMessage]);

  const submitToVoid = async (): Promise<void> => {
    if (message.trim() === "") {
      Alert.alert(
        "Empty Message",
        "Please enter a message before submitting to the void.",
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("void_messages")
        .insert([{ content: message.trim() }]);

      if (error) throw error;

      Alert.alert(
        "Message Sent",
        "Your message has been consumed by the void.",
        [{ text: "OK", onPress: () => setMessage("") }],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send message to the void. Try again later.",
      );
      console.error("Error submitting to void:", error);
    }
    Keyboard.dismiss();
  };

  const receiveFromVoid = async (): Promise<void> => {
    try {
      setViewMessage(true);
      setLoadingMessage(true);

      const { count, error: countError } = await supabase
        .from("void_messages")
        .select("*", { count: "exact" })
        .eq("verified", true);

      if (!count || countError) {
        console.error("Error getting row count:", countError);
        return;
      }

      const randomOffset = Math.floor(Math.random() * count);

      const { data, error } = await supabase
        .from("void_messages")
        .select("content")
        .range(randomOffset, randomOffset)
        .single();

      setLoadingMessage(false);

      if (error) throw error;

      if (data) {
        setReceivedMessage(data.content);
      } else {
        setReceivedMessage("The void is silent...");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to receive message from the void. Try again later.",
      );
      console.error("Error receiving from void:", error);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={(e) => {
        // Only dismiss keyboard if the target isn't the TextInput
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          Keyboard.dismiss();
        }
      }}
    >
      <SafeAreaView style={styles.container as ViewStyle}>
        {SpinningCircle(900, 0)}
        {SpinningCircle(800, 0)}
        {SpinningCircle(700, 0)}
        {SpinningCircle(600, 0)}
        {SpinningCircle(500, 0)}
        {SpinningCircle(400, 0)}
        {SpinningCircle(300, 0)}
        {SpinningCircle(200, 0)}
        <SpinningStars />

        <Text style={styles.title as TextStyle}>THE_VOID</Text>

        {viewMessage ? (
          <Text style={styles.receivedMessage as TextStyle}>
            {!loadingMessage ? receivedMessage : "..."}
          </Text>
        ) : null}

        <Animated.View
          style={[
            styles.inputContainer,
            {
              height: containerHeight,
              opacity: viewMessage ? 0 : 100,
            },
          ]}
        >
          <TextInput
            style={styles.input as TextStyle}
            placeholder="Enter your message..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={styles.submitButton as ViewStyle}
            onPress={submitToVoid}
          >
            <Text style={styles.buttonText as TextStyle}>
              SUBMIT_TO_THE_VOID
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View
          style={!viewMessage ? (styles.divider as ViewStyle) : styles.hidden}
        />

        <View style={styles.receiveContainer as ViewStyle}>
          <TouchableOpacity
            style={
              !viewMessage ? (styles.receiveButton as ViewStyle) : styles.hidden
            }
            onPress={receiveFromVoid}
          >
            <Text style={styles.buttonText as TextStyle}>
              RECEIVE_FROM_THE_VOID
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={viewMessage ? (styles.backButton as ViewStyle) : styles.hidden}
          onPress={() => setViewMessage(false)}
        >
          <Text style={styles.buttonText as TextStyle}>BACK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  hidden: {
    display: "none",
  },
  starsContainer: {
    position: "absolute",
    backgroundColor: "transparent",
    backgroundImage: "radial-gradient(white 1px, transparent 0)",
    backgroundSize: "30px 20px",
    width: 1000,
    height: 1000,
    borderRadius: "100%",
  },
  circle: {
    width: "100%",
    height: "100%",
    borderRadius: "100%",
    opacity: 0.1,
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    overflow: "hidden",
    height: "fit",
  },
  title: {
    fontSize: 36,
    color: "black",
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "black",
    padding: 12,
    marginBottom: 40,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  input: {
    height: 100,
    width: "80%",
    maxWidth: 500,
    backgroundColor: "white",
    borderWidth: 4,
    borderRadius: 8,
    padding: 15,
    color: "black",
    marginBottom: 20,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "black",
    padding: 15,
    borderRadius: 8,
    maxWidth: 500,
  },
  receiveButton: {
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "black",
    padding: 15,
    borderRadius: 8,
    maxWidth: 500,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "black",
    padding: 15,
    borderRadius: 8,
    maxWidth: 500,
    marginTop: 30,
  },
  buttonText: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    width: "80%",
    maxWidth: 500,

    height: 1,
    backgroundColor: "white",
    marginVertical: 40,
  },
  receiveContainer: {
    width: "100%",
    alignItems: "center",
  },
  receivedMessage: {
    color: "black",
    backgroundColor: "white",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
    borderWidth: 4,
    borderColor: "black",
  },
});
