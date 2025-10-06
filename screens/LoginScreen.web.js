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
        <View style={styles.inputContainer}>
          <Input
            placeholder="Enter your email"
            leftIcon={{ type: "material", name: "email" }}
            onChangeText={(username) => setEmail(username)}
            clearButtonMode="always"
            required
            containerStyle={styles.input}
          />
          <Input
            leftIcon={{ type: "material", name: "lock" }}
            placeholder="Enter your password"
            onChangeText={(password) => setPassword(password)}
            clearButtonMode="always"
            secureTextEntry
            required
            containerStyle={styles.input}
          />
        </View>
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
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    paddingTop: 60,
    paddingBottom: 60
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 30,
    color: "#508D3D",
    fontFamily: "Georgia",
    fontStyle:'italic',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
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
    marginTop: 30,
    width: '100%',
  },
  linksContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    color: "#666",
  },
  underlineText: {
    fontSize: 16,
    color: "#508D3D",
    textDecorationLine: "underline",
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  buttonText: {
    fontWeight: "bold",
    backgroundColor: '#4d9900',
    alignItems:'center',
    padding: 20,
    paddingLeft: 50,
    paddingRight: 50,
    borderRadius: 25,
    cursor: 'pointer',
  },
  logo:{
    width: 300,
    height: 300,
    borderRadius: 150,
    alignItems: "center",
    justifyContent: "center",
    resizeMode: 'contain',
  },
  text:{
    fontSize: 18,
    color:'white',
    fontWeight: 'bold',
  }
});
