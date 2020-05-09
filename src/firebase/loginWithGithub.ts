import firebase from "../Firebase";

import { toast } from 'react-toastify';

export const loginWithGithub = () => {
  const provider = new firebase.auth.GithubAuthProvider();

  firebase
    .auth()
    .signInWithPopup(provider)
    // @ts-ignore
    .then((result) => {
      toast.success("Login Successfully!");
    })
    .catch((error: any) => {
      toast.error("Login failed...");
      console.error(error);
    });
};
