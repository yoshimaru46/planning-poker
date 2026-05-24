import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../Firebase";

export const logoutWithGithub = (): void => {
  signOut(auth)
    .then(() => {
      toast.success("Logout Successfully!");
    })
    .catch((error: unknown) => {
      toast.error("Logout failed...");
      console.error(error);
    });
};
