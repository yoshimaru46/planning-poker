import React from "react";
import { useDispatch, useSelector } from "react-redux";
import firebase from "./Firebase";

import { RootState } from "./rootReducer";

import { login, logout } from "./modules/authModule";

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: RootState) => state.auth);

  const loginWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        if (user) {
          // Login successful.
          dispatch(login(user));
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  const logoutWithGithub = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Logout successful.
        dispatch(logout());
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h2>Home</h2>
      {!auth?.user && (
        <button onClick={loginWithGithub}>Login with Github</button>
      )}
      {auth?.user && (
        <>
          <p>{auth.user.displayName}</p>
          <button onClick={logoutWithGithub}>Logout</button>
        </>
      )}
    </div>
  );
};

export default Home;
