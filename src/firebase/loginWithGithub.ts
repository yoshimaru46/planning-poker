import { GithubAuthProvider, signInWithPopup, updateProfile, getAdditionalUserInfo } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../Firebase";

export const loginWithGithub = async (): Promise<void> => {
  const provider = new GithubAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const username = getAdditionalUserInfo(result)?.username;
    if (username) {
      await updateProfile(result.user, { displayName: username });
    }
    toast.success("Login Successfully!");
  } catch (error: unknown) {
    toast.error("Login failed...");
    console.error(error);
  }
};
