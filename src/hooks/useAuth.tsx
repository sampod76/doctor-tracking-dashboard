"use client";

import {
    AuthUser,
    login as loginAction,
    logout as logoutAction,
    update as updateAction,
} from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

export default function useAuth() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const login = (userData: AuthUser) => {
        dispatch(loginAction({ userData }));
    };

    const logout = () => {
        dispatch(logoutAction());
    };

    const updateUser = (data: Partial<AuthUser>) => {
        dispatch(updateAction({ ...data }));
    };

    return {
        login,
        logout,
        updateUser,
        user,
    };
}