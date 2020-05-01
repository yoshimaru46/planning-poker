import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInfo } from "firebase";

interface Auth {
  user: Pick<UserInfo, "displayName" | "photoURL"> | null;
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
    login(state: State, action: PayloadAction<UserInfo>) {
      const { displayName, photoURL } = action.payload;

      state.auth = {
        user: {
          displayName,
          photoURL,
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
