import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInfo } from "firebase";

interface Auth {
  user: Pick<UserInfo, "displayName" | "photoURL" | "uid"> | null;
}

type State = {
  auth: Auth | undefined;
};

const initialState: State = {
  auth: undefined,
};

const authModule = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state: State,
      action: PayloadAction<Pick<UserInfo, "displayName" | "photoURL" | "uid">>
    ) {
      const { displayName, photoURL, uid } = action.payload;

      state.auth = {
        user: {
          displayName,
          photoURL,
          uid,
        },
      };
    },
    logout(state: State, action: PayloadAction<undefined>) {
      state.auth = {
        user: null,
      };
    },
  },
});

export const { login, logout } = authModule.actions;

export default authModule;
