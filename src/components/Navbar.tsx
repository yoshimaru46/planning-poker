import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../rootReducer";
import firebase from "../Firebase";
import { logout } from "../modules/authModule";

const Navbar: React.FC = () => {
  const dispatch = useDispatch();

  const { auth } = useSelector((state: RootState) => state.auth);
  const user = auth?.user;

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

  return (
    <nav className="font-sans flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 bg-black shadow w-full">
      <div className="mb-2 sm:mb-0 flex justify-center items-center">
        <a href="/" className="bg-black text-white font-bold text-xl p-4">
          Planning Poker
        </a>
      </div>

      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner table">
          <img
            src={user?.photoURL || ""}
            alt="Avatar"
            className="object-cover object-center w-full h-full"
          />
        </div>
        <div className="ml-2 flex justify-center items-center text-gray-700">
          <a
            href="/"
            className="text-lg no-underline text-white ml-2"
            onClick={logoutWithGithub}
          >
            Logout
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
