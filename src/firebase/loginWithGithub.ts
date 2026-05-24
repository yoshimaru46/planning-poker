import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../Firebase";

export const loginWithGithub = (): void => {
  const provider = new GithubAuthProvider();

  signInWithPopup(auth, provider)
    .then(() => {
      toast.success("Login Successfully!");
    })
    .catch((error: unknown) => {
      toast.error("Login failed...");
      console.error(error);
    });
};
