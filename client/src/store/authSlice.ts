import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  userId: string;
  email: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAuth(state, action: PayloadAction<AuthState>) {
      console.log(action.payload);
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setAuth, clearAuth } = AuthSlice.actions;
export default AuthSlice.reducer;
