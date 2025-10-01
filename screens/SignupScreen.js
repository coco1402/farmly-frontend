import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { Button,Input } from "react-native-elements";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";
import { auth } from "../firebase";
import { UserContext } from "../navigation/user";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { postUser } from "../utils/api";
import { color } from "react-native-elements/dist/helpers";

const SignUpScreen = ({ navigation }) => {
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState("eye");
  const [postcode, setPostcode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
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

  const handleSignUp = () => {
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

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setIsLoggedIn(true)
        setIsFirstLaunch(true);
        // Only update displayName in Firebase, not photoURL
        updateProfile(auth.currentUser, {
          displayName: name
        });
        
        // Save user to MongoDB with Firebase UID
        const newUser = {
          "user_id": userCredential.user.uid,
          "username":name,
          "email":email,
          "postcode":postcode,
          "user_type":type,
          "profile_pic":avatar
          ? avatar
          : "../assets/user.png",
          "password":password
        }
        return postUser(newUser)
      })
      .catch((error) => {
        //
        alert(`Something went wrong with sign up: ${error.message || error} `);
      });
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
        <Input
          style={styles.inputContainer}   
          placeholder="Enter your image url"
          label="Profile Picture"
          value={avatar}
          onChangeText={(text) => setAvatar(text)}
          enablesReturnKeyAutomatically
          required
        />
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
  }
});
