import { signInAnonymously, updateProfile } from "firebase/auth";
import { auth } from "../Firebase";

export const loginAnonymously = async (displayName: string): Promise<void> => {
  const result = await signInAnonymously(auth);
  await updateProfile(result.user, { displayName });
};
