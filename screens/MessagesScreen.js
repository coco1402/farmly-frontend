import React, { useContext, useState, useLayoutEffect, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { Button } from "react-native-elements";
import { UserContext } from "../navigation/user";
import { Avatar } from 'react-native-paper';

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
// import Load from "react-native-loading-gif";
import { getFarms } from "../utils/api";
import { auth, db } from "../firebase";
import {
  Container,
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
  TextSection,
} from "../styles/MessageStyle";

const MessagesScreen = ({ navigation }) => {
  const [farms, setFarms] = useState([]);
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFarms().then((response) => {
      setFarms(response);
      setIsLoading(false)
    });
  }, []);

  if (farms.length !== 0) {
    const currFarm = farms.filter((farm) => {
      return farm.username === user["email"];
    });
  }

  useLayoutEffect(() => {
    if (!user || !user.email) {
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("user.sent_from_username", "==", user.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            _id: doc.data()._id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user,
          }))
        );
      },
      (error) => {
        //
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user.email]);

  const msgFromUser = messages.filter((message) => {
    return message.user.sent_from_username == user["email"];
  });
  const newMap = new Map(msgFromUser.map((m) => [m.user.sent_to_farm_id, m]));
  const unique = [...newMap.values()];

  if (isLoading === true) {
    return (
      <View style={styles.area}>
        <Text >
          I am obsessed with perfection. I want to work. I don't want to take
          this for granted.
          {`\n`}
          --Team Ditto
        </Text>
        <Image
          style={{ width: "10%", height: "10%" , alignItems: "center",
          justifyContent: "center",}}
          source={require("../gif/loadingIcon.png")}
        ></Image>
      </View>
    );
  }
  if (unique.length === 0) {
    return (
      <View style={styles.container}>
        <Text>{"Your messages will appear here..."}</Text>
      </View>
    );
  }

  return (
    <Container style= {styles.area}>
      <FlatList
        data={unique}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
             { navigation.navigate("UserChat", {
                userName: item.user.sent_from_username,
                sent_to_farm_id: item.user.sent_to_farm_id,
                sent_to_farm_email: item.user.sent_to_farm_email 
              })}
            }
          >
            <UserInfo>
            <Avatar.Image size={60} source={{uri: item.user.sent_to_farm_pic}} />
              <TextSection>
                <UserInfoText>
                  <UserName>{item.user.sent_to_farm_name}</UserName>
                </UserInfoText>
                <MessageText>{item.text}</MessageText>
              </TextSection>
            </UserInfo>
          </Card>
        )}
      />
    </Container>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#B6EBA6',
  },
  area: {
    padding: 80,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:'#B6EBA6',
  },
});
