import { createContext } from "react"
import { useState } from "react";
import { auth } from "../firebase"
import {signInWithEmailAndPassword} from "firebase/auth"

export const UserContext = createContext();

export const UserProvider= ({children}) =>{
    const [user,setUser] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [type, setType] = useState('')
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);
    const [navigationIntent, setNavigationIntent] = useState(null);

return (
    <UserContext.Provider 
    value={{
        user, 
        setUser, 
        isLoggedIn,
        setIsLoggedIn,
        type, 
        setType,
        isFirstLaunch,
        setIsFirstLaunch,
        navigationIntent,
        setNavigationIntent,
        signin: async (email, password) => {
        try {
        await signInWithEmailAndPassword(auth, email, password);
        } catch (e) {
        window.alert("Incorrect username or password!");
        }
    }
    }}>{children}</UserContext.Provider>
)
}