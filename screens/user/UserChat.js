import React, { useCallback, useContext, useLayoutEffect } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { Bubble, GiftedChat, Send } from "react-native-gifted-chat";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../../firebase";
import { getFarmById } from "../../utils/api";
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
//import Load from "react-native-loading-gif";
import { UserContext } from "../../navigation/user";

const UserChat = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [farms, setFarms] = useState([]);
  const { farm_id, farm_username, sent_to_farm_id, sent_to_farm_email } =
    route.params;
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useContext(UserContext);

  const q = query(collection(db, "chats"), orderBy("createdAt", "desc"));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ marginLeft: 20 }}>
          <Image
            rounded
            source={{
              uri: auth?.currentUser?.photoURL,
            }}
          />
        </View>
      ),
    });
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      ),
    );
    return () => {
      unsubscribe();
    };
  }, [sent_to_farm_id || farm_id]);

  const validMessages = messages.filter((msg) => {
    if (sent_to_farm_email) {
      return (
        (msg.user.sent_to_farm_id === sent_to_farm_id &&
          msg.user.sent_from_username === user.email) ||
        (msg.user.sent_from_username == sent_to_farm_email &&
          msg.user.sent_to_customer_name === user.email)
      );
    } else {
      return (
        (msg.user.sent_to_farm_id === farm_id &&
          msg.user.sent_from_username === user.email) ||
        (msg.user.sent_from_username == farm_username &&
          msg.user.sent_to_customer_name === user.email)
      );
    }
  });

  useEffect(() => {
    setMessages([]);
    setIsLoading(false);
  }, []);
  const onSend = useCallback((validMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, validMessages)
    );
    const { _id, createdAt, text, user } = validMessages[0];
    addDoc(collection(db, "chats"), { _id, createdAt, text, user });
  }, []);

  const newMsg = validMessages.filter((msg) => {
    return msg.user.sent_from_username === auth.currentUser.email;
  });
  useEffect(() => {
    getFarmById(sent_to_farm_id || farm_id)
    .then((response) => {
      setFarms(response);
    });
  }, [sent_to_farm_id || farm_id]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>`Searching for chats...` </Text>
      </View>
    )
  }

  return (
    <>
    <Pressable
    style= {styles.arrow} 
    onPress={()=>navigation.navigate('MessagesScreen')}>
    <Text style= {styles.arrowText}>⬅</Text>
    </Pressable>
      <GiftedChat
        scrollToBottom
        messages={validMessages}
        onSend={(validMessages) => onSend(validMessages)}
        showAvatarForEveryMessage={true}
        alwaysShowSend
        user={{
          sent_to_farm_id: sent_to_farm_id || farm_id,
          sent_to_farm_name: farms.name,
          sent_to_farm_email: farms.username,
          sent_to_farm_pic: farms.profile_pic,
          avatar: auth?.currentUser?.photoURL,
          sent_from_name: auth?.currentUser?.displayName,
          sent_from_username: auth?.currentUser?.email,
        }}
      />
    </>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:'#B6EBA6'
  },
  arrow:{
    paddingTop: 70,
    paddingLeft: 20,
  },
  arrowText:{
    fontSize: 30
  },
});
