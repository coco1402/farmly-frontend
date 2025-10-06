import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Image } from "react-native";
import { Button, Input } from "react-native-elements";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";
import { auth } from "../firebase";
import { UserContext } from "../navigation/user";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { postUser } from "../utils/api";
import { color } from "react-native-elements/dist/helpers";
import * as ImagePicker from 'expo-image-picker';

const SignUpScreen = ({ navigation }) => {
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState("eye");
  const [postcode, setPostcode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  let { type, setType, isFirstLaunch, setIsFirstLaunch, isLoggedIn, setIsLoggedIn } =
    useContext(UserContext);

  // Set default type to customer if not set
  useEffect(() => {
    if (!type) {
      setType("customer");
    }
  }, []);

  const handlePasswordVisibility = () => {
    if (rightIcon === "eye") {
      setRightIcon("eye-off");
      setPasswordVisibility(!passwordVisibility);
    } else if (rightIcon === "eye-off") {
      setRightIcon("eye");
      setPasswordVisibility(!passwordVisibility);
    }
  };

  const pickImage = async () => {
    // On web, this will open file picker dialog
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
      setAvatar(result.assets[0].uri); // Use local URI for now
    }
  };

  const handleSignUp = async () => {
    // Validate all fields
    if (!name || !email || !password || !confirmPassword || !postcode || !type) {
      alert("Please fill in all fields!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    let firebaseUser = null;

    try {
      // Step 1: Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      // Step 2: Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: name
      });

      // Step 3: Save user to MongoDB
      const newUser = {
        "user_id": firebaseUser.uid,
        "username": name,
        "email": email,
        "postcode": postcode,
        "user_type": type,
        "profile_pic": avatar || "../assets/user.png",
        "password": password
      };

      await postUser(newUser);

      // Step 4: Only set logged in if BOTH Firebase AND MongoDB succeed
      setIsLoggedIn(true);
      setIsFirstLaunch(true);

    } catch (error) {
      // If MongoDB fails, rollback: delete the Firebase user
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
          console.log("Firebase user deleted due to MongoDB failure");
        } catch (deleteError) {
          console.error("Failed to delete Firebase user:", deleteError);
        }
      }

      alert(`Something went wrong with sign up: ${error.message || error}`);
    }
  };

  return (
     <ScrollView style={{flex: 1}} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <View style={styles.formContainer}>
          <Input
            style={styles.inputContainer}
            placeholder="Enter your name"
            label="Name"
            value={name}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => setName(text)}
            enablesReturnKeyAutomatically
            required
            containerStyle={styles.input}
          />
          <Input
            style={styles.inputContainer}
            placeholder="Enter email"
            label="Email"
            value={email}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => setEmail(text)}
            enablesReturnKeyAutomatically
            required
            containerStyle={styles.input}
          />
            <Input
            style={styles.inputContainer}
            placeholder="Enter password "
            label="Password"
            value={password}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={passwordVisibility}
            enablesReturnKeyAutomatically
            required
            containerStyle={styles.input}
            rightIcon={
              <Pressable onPress={handlePasswordVisibility}>
                <MaterialCommunityIcons name={rightIcon} size={22} color="#232323" />
              </Pressable>
            }
          />


          <Input
            style={styles.inputContainer}
            placeholder="Confirm password "
            label="Confirm password"
            value={confirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry={passwordVisibility}
            enablesReturnKeyAutomatically
            required
            containerStyle={styles.input}
            rightIcon={
              <Pressable onPress={handlePasswordVisibility}>
                <MaterialCommunityIcons name={rightIcon} size={22} color="#232323" />
              </Pressable>
            }
          />
          <View style={styles.imagePickerContainer}>
            <Text style={styles.imagePickerLabel}>Profile Picture</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <MaterialCommunityIcons name="camera-plus" size={50} color="#86939e" />
                  <Text style={styles.placeholderText}>Click to select photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Input
            style={styles.inputContainer}
            placeholder="Enter your postcode"
            label="Postcode"
            value={postcode}
            autoCapitalize ="characters"
            onChangeText={(postcode) => setPostcode(postcode)}
            enablesReturnKeyAutomatically
            required
            containerStyle={styles.input}
          />

          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>Select a type</Text>
            <Picker
              style={{height: 120, width: '100%', marginTop: 10}}
              selectedValue={type}
              onValueChange={(value) => setType(value)}
            >
              <Picker.Item label="I am a customer" value="customer" />
              <Picker.Item label="I am a farmer" value="farmer" />
            </Picker>
          </View>

          <View style={{marginTop: 40, marginBottom: 20, width: '100%'}}>
            <Pressable
              onPress={handleSignUp}
              style={styles.registerButton}
            >
              <Text style={styles.registerText}>Register</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  container: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
    cursor: 'pointer',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#508D3D",
    fontFamily: "Georgia",
    fontStyle:'italic',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    margin: 10,
    padding: 10,
  },
  input: {
    width: '100%',
  },
  inputField: {
    fontSize: 22,
    width: '100%'
  },
  typeContainer: {
    margin: 10,
    padding: 10,
    width: '100%'
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginLeft: 10,
    marginBottom: 0
  },
  registerButton: {
    backgroundColor: '#4d9900',
    alignItems: 'center',
    padding: 20,
    paddingLeft: 50,
    paddingRight: 50,
    borderRadius: 25,
    cursor: 'pointer',
  },
  registerText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  imagePickerContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  imagePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginLeft: 10,
    marginBottom: 15,
  },
  imagePickerButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: '#86939e',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#86939e',
    textAlign: 'center',
  }
});
