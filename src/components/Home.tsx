import React from "react";
import { useDispatch, useSelector } from "react-redux";
import firebase from "./../Firebase";

import { RootState } from "../rootReducer";

import { login, logout } from "../modules/authModule";
import { useHistory } from "react-router-dom";

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: RootState) => state.auth);

  const history = useHistory();

  const loginWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();

    firebase
      .auth()
      .signInWithPopup(provider)
      // @ts-ignore
      .then((result) => {
        const user = result.user;

        if (user) {
          dispatch(
            login({
              photoURL: user.photoURL,
              uid: user.uid,
              displayName: result.additionalUserInfo?.username || "",
            })
          );
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  // @ts-ignore
  const logoutWithGithub = (e) => {
    e.preventDefault();

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

  const user = auth?.user;

  return (
    <div className="w-full flex flex-wrap">
      <div className="w-full md:w-1/2 flex flex-col">
        <div className="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-24">
          <a href="#" className="bg-black text-white font-bold text-2xl p-4">
            Planning Poker
          </a>
        </div>

        <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
          {!user && (
            <>
              <p className="text-center text-3xl">Welcome.</p>
              <div className="text-center pt-12 pb-12">
                <button
                  className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-xl"
                  onClick={loginWithGithub}
                >
                  Login with GitHub
                </button>
              </div>
            </>
          )}

          {user && (
            <>
              <p className="text-center text-3xl">Hi, {user.displayName}</p>
              <div className="text-center pt-12 pb-12">
                <button
                  className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-xl"
                  onClick={() => history.push("/create-room")}
                >
                  Create or Join room
                </button>
              </div>

              <div className="text-center">
                <button
                  className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded text-xl border-black border-2"
                  onClick={logoutWithGithub}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-1/2 shadow-2xl">
        <img
          className="object-cover w-full h-screen hidden md:block"
          src={`${process.env.PUBLIC_URL}/img/home-bg.png`}
        />
      </div>
    </div>
  );
};

export default Home;