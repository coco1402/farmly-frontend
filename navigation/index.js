import React from "react";
import { UserProvider } from "./user";
import Routers from "./Routers";
import { SafeAreaView } from 'react-native-safe-area-context';

const Providers = () => {
  return (
    
    <UserProvider>
      <Routers />
    </UserProvider>

  );
};

export default Providers;
