import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProduceList from "../screens/farmer/ProduceList";
import SingleProduce from "../screens/farmer/SingleProduce";
import { Stack } from "./AuthStack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagesScreenForFarmers from "../screens/farmer/MessagesScreenForFarmers";
import MyFarm from "../screens/farmer/MyFarm";
import SettingScreen from "../screens/SettingScreen";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import FarmerChat from "../screens/farmer/FarmerChat";

const Tab = createBottomTabNavigator();

const SettingStack = ({navigation}) => (
  <Stack.Navigator
  initialRouteName='MessagesScreenForFarmers'>
    <Stack.Screen
      name="Profile"
      component={SettingScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
const NewStack = createNativeStackNavigator()
function ChatStack(){
  return (
    <NewStack.Navigator screenOptions={{ headerShown: false }}>
    <NewStack.Screen name="MessagesScreenForFarmers" component={MessagesScreenForFarmers} />
    <NewStack.Screen name="FarmerChat" component={ FarmerChat } />
    </NewStack.Navigator>
  )
}


function ProduceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProduceList" component={ProduceList} />
      <Stack.Screen name="SingleProduce" component={SingleProduce} />
    </Stack.Navigator>
  );
}
const AppStack = () => {
  
  return (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        initiaRouteName= "MyFarm"
        name="MyFarm"
        component={MyFarm}
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
      <Tab.Screen
        name="ProduceList"
        component={ProduceStack}
        options={({route}) => ({
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="food-apple"
              color={color}
              size={size}
            />
          ),
        })}
      />
      <Tab.Screen
        name="MessagesScreenForFarmers"
        component={ChatStack}
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
      <Tab.Screen
        name="Setting"
        component={SettingStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
  
};

export default AppStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
