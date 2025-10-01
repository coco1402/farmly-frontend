import React, { useCallback, useContext,useLayoutEffect } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { Bubble, GiftedChat, Send } from "react-native-gifted-chat";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../../firebase";
import { getFarmById } from "../../utils/api";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";


const FarmerChat = ({navigation, route}) =>{
    const [messages, setMessages] = useState([]);
    const {userName, sent_to_farm_id, sent_to_farm_email} = route.params; 
    const q = query(
        collection(db, "chats"),
        orderBy("createdAt", "desc")
      );
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
            snapshot.docs.map((doc) => (
              {
              _id: doc.data()._id,
              createdAt: doc.data().createdAt.toDate(),
              text: doc.data().text,
              user: doc.data().user,
            }))
          )
        );
        return () => {
          unsubscribe();
        };
      }, [userName]);
      const renderMessages= messages.filter((msg)=> {
      return msg.user.sent_from_username ===userName&&msg.user.sent_to_farm_id ===sent_to_farm_id ||msg.user.sent_to_customer_name===userName && msg.user.sent_from_username===sent_to_farm_email
      })
      useEffect(() => {
        setMessages([]);
      }, []);
      const onSend = useCallback((renderMessages = []) => {
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, renderMessages)
        );
        const { _id, createdAt, text, user } = renderMessages[0];
        addDoc(collection(db, "chats"), { _id, createdAt, text, user });
      }, []);

    return (
        <>
        <Pressable 
        onPress={()=>navigation.navigate('MessagesScreenForFarmers')}
        style= {styles.arrow} 
        >
        <Text style= {styles.arrowText}>⬅</Text>
        </Pressable>
        <GiftedChat
          scrollToBottom
          messages={renderMessages}
          onSend={(renderMessages) => onSend(renderMessages)}
          showAvatarForEveryMessage={true}
          alwaysShowSend
          user={{
            _id:auth?.currentUser?.email,
            sent_to_customer_name: userName,
            avatar: auth?.currentUser?.photoURL,
            sent_from_name: auth?.currentUser?.displayName,
            sent_from_username: auth?.currentUser?.email,
          }}
        />
      </>
    )
}

export default FarmerChat

const styles= StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#B6EBA6'
    },
    arrow:{
      paddingTop: 70,
      paddingLeft: 20,
    }, 
    arrowText:{
      fontSize: 30
    }
})