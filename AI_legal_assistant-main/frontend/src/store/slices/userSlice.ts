import type { StateCreator } from "zustand";

interface UserInfo {
    email: string;
    username: string;
    user_type: string;
}

export interface UserSlice {
    userInfo: UserInfo;
    changeUserInfo: (userInfo: UserInfo) => void;
    resetUserInfo: () => void;
}

const initialState: UserInfo = {
    email: "",
    username: "",
    user_type: "",
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
    userInfo: initialState,
    changeUserInfo: (userInfo: UserInfo) => set({ userInfo }),
    resetUserInfo: () => set({ userInfo: initialState }),
});
