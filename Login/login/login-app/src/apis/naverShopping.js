import axios from "axios";

export const fetchRunningShoes = async (keyword, { start = 1, display = 10 } = {}) => {
    try {
        const response = await axios.get(`/api/naver-shopping`, {
            params: { query: keyword, start, display },
        });
        console.log("Full response from proxy:", response.data); // Log the full response
        return response.data; // Return the full response object
    } catch (error) {
        console.error("프록시 서버 오류:", error);
        return { items: [], total: 0 }; // Return a default structure on error
    }
};