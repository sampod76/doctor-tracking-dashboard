import { TFileDocument } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
    last_name?: string;
    first_name?: string;
    firstName?: string;
    lastName?: string;
    profile_image?: TFileDocument;
    image?: TFileDocument;
    user_type: string;
    is_change_password?: boolean;
    roleBaseUserId?: string;
    userId?: string;
    userUniqueId?: string;
    email?: string;
    is_main_account?: boolean;
    [key: string]: any;
}

interface AuthenticationState {
    isAuthenticated: boolean;
    accessToken: string | null;
    user: AuthUser | null;
}

export interface PayloadActionData {
    userData?: AuthUser;
    accessToken?: string;
    [key: string]: any;
}

const initialState: AuthenticationState = {
    isAuthenticated: false,
    accessToken: null,
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<PayloadActionData | AuthUser>) => {
            state.isAuthenticated = true;
            if ("userData" in action.payload && action.payload.userData) {
                state.user = action.payload.userData;
                state.accessToken = action.payload.accessToken || null;
            } else {
                state.user = action.payload as AuthUser;
            }
        },
        update: (
            state,
            action: PayloadAction<Partial<PayloadActionData> | Partial<AuthUser>>,
        ) => {
            if (state.user) {
                if ("userData" in action.payload && action.payload.userData) {
                    state.user = {
                        ...state.user,
                        ...action.payload.userData,
                    };
                } else {
                    const { accessToken, ...restUserProps } = action.payload as any;
                    state.user = {
                        ...state.user,
                        ...restUserProps,
                    };
                }
            }
            if ("accessToken" in action.payload && action.payload.accessToken) {
                state.accessToken = action.payload.accessToken;
            }
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
        },
    },
});

export const { login, logout, update } = authSlice.actions;
export default authSlice.reducer;
