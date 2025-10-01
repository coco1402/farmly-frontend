import React, { useContext, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {auth} from "../firebase"
import { UserContext } from "./user";
import AuthStack from "./AuthStack";
import AppStackForFarmers from "./AppStackForFarmers";
import AppStackForCustomers from './AppStackForCustomers'
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
const Routes = () => {
  const { user, setUser , type, isFirstLaunch, isLoggedIn} = useContext(UserContext);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
        setUser(user)
    });
  }, []);

  return (
    <NavigationContainer>
      {(user&&isLoggedIn) ? (type === "farmer" ?  <AppStackForFarmers/> : <AppStackForCustomers/>) : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes;
