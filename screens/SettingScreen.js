import React, {useContext, useEffect, useState} from "react";
import { View, StyleSheet, Text, Image, Alert, Pressable, ScrollView} from "react-native";
import { signOut, updateEmail, updatePassword, updateProfile, getAuth} from "firebase/auth";
import { UserContext } from "../navigation/user";
import { getUsers, updateUserById } from "../utils/api";
import { DEFAULT_USER_AVATAR_LOCAL } from "../constants/defaults";

const SettingScreen = ({navigation}) =>{
    let { user, setUser, setIsLoggedIn, setType, setNavigationIntent }= useContext(UserContext)
    const [account, setAccount] = useState([]);
    const [isLoading, setIsLoading] = useState(true)
    const [copy, setCopy] = useState({})
    let myAccount = []
    const auth = getAuth();
    
    // Check if user is a guest
    const isGuest = user?.email === "guest@farmly.com";
    useEffect(() => {
        if (user?.email) {
            getUsers()
            .then((response) => {
                const listOfUsers = [...response]
                return myAccount = listOfUsers.filter((account) => {
                    return account.email === user.email
                })
            })
            .then(() => {
                setAccount(myAccount)
                if (myAccount.length > 0) {
                    setCopy(myAccount[0])
                }
                setIsLoading(false)
            })
            .catch((error) => {
                //
                setIsLoading(false)
            })
        } else {
            setIsLoading(false)
        }
    }, [user?.email])
    
    const signOutNow = () => {
        signOut(auth)
          .then(() => {
            setUser(null);
            setIsLoggedIn(false);
            setType('');
          })
          .catch(() => {
            //alert(error.message);
          });
      };
    const handlePassword = (text) => {
        updatePassword(auth.currentUser, text)
        .then(() => {
            const updateBody = {
                password: text
            }
            updateUserById(account[0].user_id, updateBody)
            alert('Password Changed!')
        })
        .catch(() => {
            alert('Something went wrong, please try again!')
        });
    }
    const resetPassword = () => {
        Alert.prompt("Change your password", "Please input your new password here", [
            {
                text:"Submit",
                onPress:(text) => handlePassword(text)
            },
            {
                text:"Cancel",
                onPress:() => {alert('Canceled')}
            }
        ], "plain-text", "")
    };

    const handleEmail = (text) => {
        updateEmail(auth.currentUser, text)
        .then(() => {
            const updateBody = {
                email: text
            }
            updateUserById(account[0].user_id, updateBody)
            signOutNow()
            alert('Email Changed!')
        })
        .catch(() => {
            alert('Something went wrong try again!')
        })
    }

    const resetEmail = () => {
        Alert.prompt("Reset your email", "Please input the new email here", [
            {
                text:"Submit",
                onPress:(text) => handleEmail(text)
            },
            {
                text:"Cancel",
                onPress:() => {alert('Canceled')}
            }
        ], "plain-text", "")

    };

    const handleChangePic = (text) => {
        const accountCopy = {...account[0]}
        accountCopy.profile_pic = text
        setCopy(accountCopy)
        updateProfile(auth.currentUser, {
            displayName: auth.currentUser.displayName, 
            photoURL: text
          })
        .then(() => {
            const updateBody = {
                profile_pic: text
            }
            updateUserById(account[0].user_id, updateBody)
        })
        .catch(() => {
          alert('Something went wrong try again!')
        });
    }

    const changePic = () => {
        Alert.prompt("Upload your photo", "Please upload the pic here", [
            {
                text:"Submit",
                onPress:(text) => {handleChangePic(text)}
            },
            {
                text:"Cancel",
                onPress:() => {}
            }
        ], "plain-text", "")
    };

    const handleUsername = (text) => {
        const accountCopy = {...account[0]}
        accountCopy.username = text
        setCopy(accountCopy)
        const updateBody = {
            username: text
        }
        updateUserById(account[0].user_id, updateBody)
    }

    const resetUsername= () => {
        Alert.prompt("Change your username", "What's your next username", [
            {
                text:"Submit",
                onPress:(text) => {handleUsername(text)}
            },
            {
                text:"Cancel",
                onPress:() => {}
            }
        ], "plain-text", "")
    }

        return isLoading ? (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        )
        :
        (
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                <Image 
                style={styles.Logo}
                source={isGuest ? DEFAULT_USER_AVATAR_LOCAL : (copy?.profile_pic ? {uri: copy.profile_pic} : DEFAULT_USER_AVATAR_LOCAL)}/>
                <Text style={styles.titleText}>{isGuest ? 'Guest User' : (copy?.username || 'User')}</Text>
                
                {/* Show different buttons based on guest status */}
                {isGuest ? (
                    <>
                        <Text style={styles.guestText}>You're browsing as a guest</Text>
                        <Pressable style={styles.button} onPress={() => {
                            // Set intent to navigate to signup, then reset to Auth stack
                            setNavigationIntent('SignupScreen');
                            setUser(null);
                            setIsLoggedIn(false);
                            setType('');
                        }}>
                            <Text style={styles.text}>Create Account</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={signOutNow}>
                            <Text style={styles.text}>Back to Login</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Pressable style={styles.button} onPress={changePic}>
                            <Text style={styles.text}>Change photo</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={resetUsername}>
                            <Text style={styles.text}>Reset username</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={resetEmail}>
                            <Text style={styles.text}>Reset email</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={resetPassword}>
                            <Text style={styles.text}>Reset password</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={signOutNow}>
                            <Text style={styles.text}>Sign Out</Text>
                        </Pressable>
                    </>
                )}
            </ScrollView>
          )
    
}

export default SettingScreen

const styles= StyleSheet.create({
    loadingContainer:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#B6EBA6'
    },
    scrollView:{
        flex: 1,
        backgroundColor:'#B6EBA6'
    },
    scrollViewContent:{
        flexGrow: 1,
        alignItems:'center',
        justifyContent:'center',
        paddingVertical: 40
    },
    input:{
        margin: 10,
        borderBottomColor: "solid grey",
        borderBottomWidth: 0.5,
        padding: 10,
    },
    Logo: {
        width: 200,
        height: 200,
        borderRadius: 100/2,
        overflow: "hidden",
        borderWidth: 3,
        borderColor: "white",
    },
    titleText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop:10
    },
    button: {
        width: 250,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#4d9900',
        marginTop:40,
        borderRadius: 8,
        shadowColor: "black",
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        padding: 4,
      },
      text: {
        fontSize: 18,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
      },
      guestText: {
        fontSize: 16,
        color: '#666',
        marginTop: 20,
        marginBottom: 30,
        fontStyle: 'italic'
      }
})