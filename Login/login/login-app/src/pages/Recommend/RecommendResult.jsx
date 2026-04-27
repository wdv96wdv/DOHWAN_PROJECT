import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchRunningShoes } from "../../apis/naverShopping";
import { getWishlist, addWishlist, deleteWishlist } from "../../apis/wishlist";
import useAuthStore from "../../store/useAuthStore";
import "../../assets/css/wishlist.css";
import "../../assets/css/auth.css";
import Swal from 'sweetalert2';
import { Heart, ShoppingCart, Sparkles, Info } from 'lucide-react';
import Loading from "../../components/Common/Loading";
import { Helmet } from 'react-helmet-async';

const RecommendResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useAuthStore(state => state.userInfo);

  const { gender, purpose, budget } = location.state || {};
  const [products, setProducts] = useState([]);
  const [start, setStart] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();
  const display = 9;

  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    if (userInfo) {
      getWishlist()
        .then((res) => {
          const items = res.data || [];
          const wishlistedProductIds = new Set(items.map((item) => item.productId));
          setWishlist(wishlistedProductIds);
        })
        .catch((error) => console.error("Wishlist initialization failed:", error));
    }
  }, [userInfo]);

  const handleWishlistClick = async (product) => {
    if (!userInfo) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to save products.',
        confirmButtonColor: 'var(--primary)',
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
      console.error("Wishlist toggle failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong.',
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
    fetchRunningShoes(keyword, { start: 1, display }).then((data) => {
      let fetchedProducts = data.items || [];
      if (budget) {
        fetchedProducts = fetchedProducts.filter(
          (item) => Number(item.lprice) <= Number(budget)
        );
      }

      setProducts(fetchedProducts);
      setTotal(data.total || 0);
      setStart(1 + display);
      setLoading(false);
    });
  }, [gender, purpose, budget]);

  return (
    <div className="wishlist-page">
      <Helmet>
        <title>Dorunning | 추천결과</title>
        <meta name="description" content="당신에게 가장 잘 어울리는 러닝화 추천 결과입니다. 성능과 스타일을 모두 잡은 최적의 기어를 확인해보세요." />
        <meta property="og:title" content="Dorunning | 추천결과" />
        <meta property="og:description" content="당신에게 가장 잘 어울리는 러닝화 추천 결과입니다." />
        <link rel="canonical" href="https://dorunning.vercel.app/recommend/result" />
      </Helmet>
      <header className="wishlist-header">
        <h1><Sparkles size={40} color="var(--primary)" style={{verticalAlign: 'middle', marginRight: '16px'}} /> RECOMMENDATIONS</h1>
        <p>We found these running shoes matching your criteria.</p>
      </header>

      <div className="product-grid">
        {products.map((item, index) => (
          <div key={index} className="product-card glass-card">
            <div className="product-img-wrapper">
              <img src={item.image} alt={item.title} className="product-img" />
            </div>
            <div className="product-info">
              <h3 className="product-title" dangerouslySetInnerHTML={{ __html: item.title }} />
              <p className="product-price">{Number(item.lprice).toLocaleString()} KRW</p>
              
              <div className="product-actions">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="product-btn btn-buy">
                  <ShoppingCart size={18} /> BUY NOW
                </a>
                <button
                  onClick={() => handleWishlistClick(item)}
                  className={`product-btn btn-wish ${wishlist.has(item.productId) ? 'active' : ''}`}
                >
                  <Heart size={18} fill={wishlist.has(item.productId) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={observerRef} style={{ height: "120px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && <Loading inline={true} text="더 많은 신발을 찾는 중..." />}
        {!loading && products.length >= total && products.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You've reached the end of personalized recommendations.</p>
        )}
      </div>
    </div>
  );
};

export default RecommendResult;