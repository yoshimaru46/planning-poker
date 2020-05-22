import React, { createContext, useEffect, useState } from "react";
import firebase from "firebase/app";

export const UserContext = createContext<firebase.User | undefined | null>(undefined);

const UserProvider: React.FC = (props) => {
  const [user, setUser] = useState<firebase.User | undefined | null>(undefined);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((userAuth) => {
      setUser(userAuth);
    });
  }, []);

  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  );
};
export default UserProvider;
