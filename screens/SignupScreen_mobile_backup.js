import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Image, Alert } from "react-native";
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
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
     <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={true}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ height: 80 }} />
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
                <MaterialCommunityIcons name="camera-plus" size={40} color="#86939e" />
                <Text style={styles.placeholderText}>Tap to select photo</Text>
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
        />

        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>Select a type</Text>
          <Picker 
            style={{height: 150, width: '100%', marginTop: -30}}
            selectedValue={type}
            onValueChange={(value) => setType(value)}
          >
            <Picker.Item label="I am a customer" value="customer" />
            <Picker.Item label="I am a farmer" value="farmer" />
          </Picker>
        </View>

        <View style={{marginTop: 50, marginBottom: 20, width: '80%'}}>
          <Button
            title="Register"
            onPress={handleSignUp}
            color="#4d9900"
          />
        </View>
      

      </View >

    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  inputContainer: {
    margin: 10,
    padding: 10,
  },
  inputField: {
    fontSize: 22,
    width: '80%'
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
    marginLeft: 0,
    marginBottom: 0
  },
  imagePickerContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 15,
  },
  imagePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginLeft: 10,
    marginBottom: 10,
  },
  imagePickerButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#86939e',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#86939e',
    textAlign: 'center',
  }
});
