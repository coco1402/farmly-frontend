import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, ScrollView } from "react-native";
import { Button } from "react-native-elements";
import { useContext } from "react";
import { UserContext } from "../navigation/user";
import { Input } from "react-native-elements";
import { getUsers } from "../utils/api";

const LoginScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  let { signin, type, setType , user, setUser, isFirstLaunch, setIsFirstLaunch, isLoggedIn, setIsLoggedIn}= useContext(UserContext)

    useEffect(() => {
      getUsers()
      .then((response) => {
        setUsers(response);
      });
    }, []);
    

    const handleLogin = (email)=>{
      const matchedUser = users.find((user) => {
        return user.email.toLowerCase() === email.toLowerCase();
      });

      if(matchedUser){
        setIsFirstLaunch(false)
        setType(matchedUser.user_type || "customer")
        setIsLoggedIn(true)
      }else{
        // If no user found in DB, default to customer type
        setIsFirstLaunch(false)
        setType("customer")
        setIsLoggedIn(true)
      }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image
        style={styles.logo}
        source={require('../gif/farmlyLogo.png')}/>
        <Text style={styles.header}>Welcome to Farmly Marketplace!</Text>
        <Input
          placeholder="Enter your email"
          leftIcon={{ type: "material", name: "email" }}
          onChangeText={(username) => setEmail(username)}
          clearButtonMode="always"
          required
        />
        <Input
          leftIcon={{ type: "material", name: "lock" }}
          placeholder="Enter your password"
          onChangeText={(password) => setPassword(password)}
          clearButtonMode="always"
          secureTextEntry
          required
        />
        <Pressable
          onPress={()=> [signin(email, password), handleLogin(email)]}
          style={styles.buttonText}
        >
        <Text style={styles.text}>Log in</Text>
        </Pressable>

        <View style={styles.optionsContainer}>
          <Text style={styles.optionText}>Don't have an account?</Text>
          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignupScreen")}
            >
              <Text style={styles.underlineText}>
                Register now
              </Text>
            </TouchableOpacity>
            <Text style={styles.optionText}> or </Text>
            <TouchableOpacity
              onPress={() => {
                // Set up guest user
                setIsLoggedIn(true);
                setType("customer");
                setIsFirstLaunch(false);
                setUser({
                  email: "guest@farmly.com",
                  displayName: "Guest User",
                  photoURL: "../assets/user.png"
                });
              }}
            >
              <Text style={styles.underlineText}>
                Browse as guest
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingTop: 80,
    paddingBottom: 40
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop:50,
    marginBottom: 20,
    color: "#508D3D",
    fontFamily: "Georgia",
    fontStyle:'italic'
  },
  button: {
    width: "100%",
    padding: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  optionsContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },
  linksContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  optionText: {
    fontSize: 14,
    color: "#666",
  },
  underlineText: {
    fontSize: 14,
    color: "#508D3D",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
    // height: windowHeight / 15,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  buttonText: {
    fontWeight: "bold",
    backgroundColor: '#4d9900',
    alignItems:'center',
    padding:17,
    paddingLeft:30,
    paddingRight:30,
    borderRadius: 20
  },
  logo:{
    width:"80%",
    height:"40%",
    borderRadius: 400/ 2,
    alignItems: "center",
    justifyContent: "center",
  },
  text:{
    fontSize:20,
    color:'white'
  }
});
