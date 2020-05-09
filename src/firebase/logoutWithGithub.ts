import firebase from "../Firebase";
import { toast } from "react-toastify";

// @ts-ignore
export const logoutWithGithub = (e) => {
  e.preventDefault();

  firebase
    .auth()
    .signOut()
    .then(() => {
      toast.success("Logout Successfully!");
    })
    .catch((error: any) => {
      toast.error("Logout failed...");
      console.error(error);
    });
};
