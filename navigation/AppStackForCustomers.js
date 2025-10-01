import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FarmList from "../screens/user/FarmList";
import SingleFarm from "../screens/user/SingleFarm";
import { Stack } from "./AuthStack";
import MessagesScreen from "../screens/MessagesScreen";
import SettingScreen from "../screens/SettingScreen";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import UserChat from "../screens/user/UserChat";
import { useContext } from "react";
import { UserContext } from "./user";

const Tab = createBottomTabNavigator();

function FarmStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FarmList" component={FarmList} />
      <Stack.Screen name="SingleFarm"  component={SingleFarm} />
      <Stack.Screen name="UserChat" component={UserChat} />
    </Stack.Navigator>
  );
}

function MessagesStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
      <Stack.Screen name="UserChat" component={UserChat} />
    </Stack.Navigator>
  )
}


const AppStackForCustomers = () => {
  const { user } = useContext(UserContext);
  const isGuest = user?.email === "guest@farmly.com";

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        initiaRouteName= "Farms"
        name="Farms"
        component={FarmStack}
        options={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        })}
      />
      {!isGuest && (
        <Tab.Screen
          name="Messages"
          component={MessagesStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="chatbox-ellipses-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppStackForCustomers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
