import { getRequest, postRequest } from "../instance.ts";

export const postUserLogin = (email: string, password: string) => {
    return postRequest("/user/login", { email, password });
};


export const postUserRegister = (email: string, password: string, username: string) => {
    return postRequest("/user/register", { email, password, username });
};

export const getUserInfo = () => {
    return getRequest("/user/info");
};

export const postUserLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};

