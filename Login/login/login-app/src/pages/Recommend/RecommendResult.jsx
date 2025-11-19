import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchRunningShoes } from "../../apis/naverShopping";
import { getWishlist, addWishlist, deleteWishlist } from "../../apis/wishlist"; // 찜하기 API import
import { LoginContext } from "../../contexts/LoginContextProvider"; // 로그인 컨텍스트 import
import styles from "../../assets/css/RecommendResult.module.css";
import Swal from 'sweetalert2';

const RecommendResult = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 로그인 페이지로 이동하기 위해 추가
  const { userInfo } = useContext(LoginContext); // 로그인 상태와 사용자 정보 가져오기

  const { gender, purpose, budget } = location.state || {};
  const [products, setProducts] = useState([]);
  const [start, setStart] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();
  const display = 9;

  // 찜 목록 상태 관리 (Set을 사용하여 빠른 조회를 위함)
  const [wishlist, setWishlist] = useState(new Set());

  // 로그인한 사용자의 찜 목록을 불러오는 useEffect
  useEffect(() => {
    if (userInfo) {
      getWishlist()
        .then((data) => {
          const wishlistedProductIds = new Set(data.map((item) => item.productId));
          setWishlist(wishlistedProductIds);
        })
        .catch((error) => console.error("찜 목록 초기화 실패:", error));
    }
  }, [userInfo]);

  // 찜하기 버튼 클릭 핸들러
  const handleWishlistClick = async (product) => {
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

    const isWishlisted = wishlist.has(product.productId);
    const productData = {
      productId: product.productId,
      title: product.title,
      link: product.link,
      image: product.image,
      lprice: Number(product.lprice),
    };

    try {
      if (isWishlisted) {
        await deleteWishlist(product.productId);
        setWishlist((prev) => {
          const newWishlist = new Set(prev);
          newWishlist.delete(product.productId);
          return newWishlist;
        });
      } else {
        await addWishlist(productData);
        setWishlist((prev) => new Set(prev).add(product.productId));
      }
    } catch (error) {
      console.error("찜하기 기능 처리 중 오류 발생:", error);
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: '요청을 처리하는 중 문제가 발생했습니다.',
      });
    }
  };

  const handleLoadMore = useCallback(() => {
    if (loading || products.length >= total) return;

    setLoading(true);
    const keyword = [gender, purpose, "러닝화"].filter(Boolean).join(" ");
    fetchRunningShoes(keyword, { start, display }).then((data) => {
      let newProducts = data.items || [];
      if (budget) {
        newProducts = newProducts.filter(
          (item) => Number(item.lprice) <= Number(budget)
        );
      }
      setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      setStart((prevStart) => prevStart + display);
      setLoading(false);
    });
  }, [loading, products.length, total, start, gender, purpose, budget]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleLoadMore]);

  useEffect(() => {
    setProducts([]);
    setStart(1);
    setTotal(0);
    setLoading(true);

    const keyword = [gender, purpose, "러닝화"].filter(Boolean).join(" ");
    console.log("Searching with keyword:", keyword);

    fetchRunningShoes(keyword, { start: 1, display }).then((data) => {
      console.log("Received data:", data);

      let fetchedProducts = data.items || [];
      if (budget) {
        fetchedProducts = fetchedProducts.filter(
          (item) => Number(item.lprice) <= Number(budget)
        );
        console.log("Filtered products by budget:", fetchedProducts);
      }

      setProducts(fetchedProducts);
      setTotal(data.total || 0);
      setStart(1 + display);
      setLoading(false);
    });
  }, [gender, purpose, budget]);

  return (
    <div className={styles.resultContainer}>
      <h1>추천 러닝화</h1>
      <p>당신의 조건에 맞는 러닝화를 네이버 쇼핑에서 찾아드렸어요.</p>

      <div className={styles.cardList}>
        {products.map((item, index) => (
          <div key={index} className={styles.card}>
            <img src={item.image} alt={item.title} />
            <h3 dangerouslySetInnerHTML={{ __html: item.title }} />
            <p>{Number(item.lprice).toLocaleString()}원</p>
            <div className={styles.cardActions}>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                구매하러 가기
              </a>
              {/* 찜하기 버튼 추가 */}
              <button
                onClick={() => handleWishlistClick(item)}
                className={`${styles.wishlistButton} ${
                  wishlist.has(item.productId) ? styles.wishlisted : ""
                }`}
              >
                {wishlist.has(item.productId) ? "❤️ 찜 해제" : "🤍 찜하기"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div ref={observerRef} style={{ height: "20px" }} />
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default RecommendResult;