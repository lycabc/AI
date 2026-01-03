import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { BACKEND_ENDPOINT } from "./config.ts";
import { postUserLogout } from "./api/userApi.ts";
import useStore from "@/store/store.ts";

// 创建一个 axios 实例
const axiosInstance = axios.create({
    baseURL: BACKEND_ENDPOINT,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // console.log(`Response URL: ${(response.config as any).url}`);
        // console.log("response: ", response);
        return response;
    },
    async (error) => {
        // 检查是否有skipAuthCheck标记
        if (error.config && error.config.skipAuthCheck) {
            // 如果请求中带有skipAuthCheck标记，则不做401检查
            return Promise.reject(error);
        }

        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data.detail === "Unauthorized"
        ) {
            // 清除本地状态并跳转
            postUserLogout();
            useStore.getState().resetUserInfo();
        }

        return Promise.reject(error);
    }
);
// GET 方法封装
export const getRequest = (url: string, params = {}, config: AxiosRequestConfig = {}) => {
    return axiosInstance.get(url, {
        params,
        ...config,
    });
};

// POST 方法封装
export const postRequest = (url: string, data = {}, config: AxiosRequestConfig = {}) => {
    return axiosInstance.post(url, data, {
        ...config,
    });
};

export default axiosInstance;
