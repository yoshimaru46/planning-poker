import React, { createContext, useEffect, useState } from "react";
import firebase from "firebase/app";

export const UserContext = createContext<firebase.User | null>(null);

const UserProvider: React.FC = (props) => {
  const [user, setUser] = useState<firebase.User | null>(null);

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
