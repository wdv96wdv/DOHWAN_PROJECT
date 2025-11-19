import React, { useEffect, useState, useContext } from 'react';
import { getWishlist, deleteWishlist } from '../apis/wishlist';
import { LoginContext } from '../contexts/LoginContextProvider';
import { useNavigate } from 'react-router-dom';
import cardStyles from '../assets/css/RecommendResult.module.css'; // 카드 스타일 재사용
import Swal from 'sweetalert2';

const WishlistPage = () => {
  const { userInfo } = useContext(LoginContext);
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      Swal.fire({
        icon: 'warning',
        title: '로그인이 필요합니다',
        text: '찜하기 기능을 사용하려면 로그인해주세요.',
        confirmButtonText: '확인',
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    setLoading(true);
    getWishlist()
      .then(data => {
        setWishlistItems(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("찜 목록을 불러오는 데 실패했습니다.", error);
        setLoading(false);
      });
  }, [userInfo, navigate]);

  const handleDeleteWishlistItem = async (productId) => {
    try {
      await deleteWishlist(productId);
      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
    } catch (error) {
      console.error("찜하기 기능 처리 중 오류 발생:", error);
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: '요청을 처리하는 중 문제가 발생했습니다.',
      });
    }
  };

  return (
    <div className={cardStyles.resultContainer}>
      <h1>찜 목록</h1>
      <p>찜한 러닝화들을 확인하고 관리할 수 있습니다.</p>
      
      <div>
        {loading ? (
          <p>찜 목록을 불러오는 중...</p>
        ) : wishlistItems.length > 0 ? (
          <div className={cardStyles.cardList}>
            {wishlistItems.map((item) => (
              <div key={item.productId} className={cardStyles.card}>
                <img src={item.image} alt={item.title} />
                <h3 dangerouslySetInnerHTML={{ __html: item.title }} />
                <p>{Number(item.lprice).toLocaleString()}원</p>
                <div className={cardStyles.cardActions}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    구매하기
                  </a>
                  <button
                    onClick={() => handleDeleteWishlistItem(item.productId)}
                    className={`${cardStyles.wishlistButton} ${cardStyles.wishlisted}`}
                  >
                    ❤️ 찜 해제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>찜한 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
