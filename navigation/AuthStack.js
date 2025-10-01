import { createNativeStackNavigator } from "@react-navigation/native-stack"
import SignUpScreen from "../screens/SignupScreen";
import LoginScreen from "../screens/LoginScreen";
import { useContext, useEffect } from "react";
import { UserContext } from "./user";

export const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const { navigationIntent, setNavigationIntent } = useContext(UserContext);

  useEffect(() => {
    // Clear navigation intent after using it
    if (navigationIntent) {
      const timer = setTimeout(() => {
        setNavigationIntent(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigationIntent, setNavigationIntent]);

  return (
     <Stack.Navigator 
       initialRouteName={navigationIntent || "LoginScreen"}
       screenOptions={{ headerShown: false }}
     >
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignUpScreen} />
        </Stack.Navigator>
  )
       

}

export default AuthStack;