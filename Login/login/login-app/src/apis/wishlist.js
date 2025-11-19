import api from './api'; // 우리가 설정한 axios 인스턴스

// 현재 사용자의 찜 목록 가져오기
export const getWishlist = async () => {
    try {
        const response = await api.get('/api/wishlist');
        return response.data;
    } catch (error) {
        console.error("찜 목록을 불러오는 데 실패했습니다.", error);
        throw error;
    }
};

// 찜 목록에 아이템 추가
export const addWishlist = async (item) => {
    try {
        const response = await api.post('/api/wishlist', item);
        return response.data;
    } catch (error) {
        console.error("찜 목록에 추가하는 데 실패했습니다.", error);
        throw error;
    }
};

// 찜 목록에서 아이템 삭제
export const deleteWishlist = async (productId) => {
    try {
        const response = await api.delete(`/api/wishlist/${productId}`);
        return response.data;
    } catch (error) {
        console.error("찜 목록에서 삭제하는 데 실패했습니다.", error);
        throw error;
    }
};
