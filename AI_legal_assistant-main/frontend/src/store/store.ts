import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createUserSlice } from "./slices/userSlice.ts";
import type { UserSlice } from "./slices/userSlice.ts";
import { createCaseSlice } from "./slices/caseSlice.ts";
import type { CaseSlice } from "./slices/caseSlice.ts";

// 定义应用状态的类型
export type State = UserSlice & CaseSlice;

// 创建主 store，并应用 persist 中间件
const useStore = create<State>()(
    persist(
        (set, get, api) => ({
            ...createUserSlice(set, get, api),
            ...createCaseSlice(set, get, api),
        }),
        {
            name: "app-storage",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);


export default useStore;
