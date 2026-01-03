import getRequest from "../instance";

export const getLeasonList = (page: number, limit: number, leason_type: string, search_text: string) => {
    return getRequest("/learn/leason_list", {
        params: {
            page,
            limit,
            leason_type,
            search_text
        }
    })
}

