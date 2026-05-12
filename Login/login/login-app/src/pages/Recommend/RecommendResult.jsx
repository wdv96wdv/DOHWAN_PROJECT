import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchRunningShoes } from "../../apis/naverShopping";
import { getWishlist, addWishlist, deleteWishlist } from "../../apis/wishlist";
import useAuthStore from "../../store/useAuthStore";
import "../../assets/css/wishlist.css";
import "../../assets/css/auth.css";
import Swal from 'sweetalert2';
import { Heart, ShoppingCart, Sparkles, Info, ArrowLeft, Zap } from 'lucide-react';
import Loading from "../../components/Common/Loading";
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const RecommendResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useAuthStore(state => state.userInfo);

  const { gender, purpose, budget, goal } = location.state || {};
  const [products, setProducts] = useState([]);
  const [start, setStart] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();
  const display = 12;

  const [wishlist, setWishlist] = useState(new Set());

  // Helper to build smart AI keywords
  const buildSmartKeyword = useCallback(() => {
    let base = [gender, purpose, "러닝화"].filter(Boolean);

    // Goal mapping
    if (goal === "속도") base.push("레이싱화");
    if (goal === "안정성") base.push("안정화");
    if (goal === "내구성") base.push("트레이닝화");

    return base.join(" ");
  }, [gender, purpose, goal]);

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
    }
  };

  const handleLoadMore = useCallback(() => {
    if (loading || products.length >= total) return;

    setLoading(true);
    const keyword = buildSmartKeyword();
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
  }, [loading, products.length, total, start, budget, buildSmartKeyword]);

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

    const keyword = buildSmartKeyword();
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
  }, [buildSmartKeyword, budget]);

  return (
    <div className="wishlist-page" style={{ paddingTop: '100px' }}>
      <Helmet>
        <title>Dorunning | Analysis Results</title>
      </Helmet>

      <motion.header
        className="wishlist-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pulse-circle" style={{ width: '150px', height: '150px' }}></div>
        <button onClick={() => navigate("/recommend")} className="btn-auth outline" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.8rem' }}>
          <ArrowLeft size={14} style={{ marginRight: '8px' }} /> 다시 분석하기
        </button>
        <h1>
          <Zap size={40} className="text-primary" style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} />
          분석 <span style={{ color: 'var(--primary)' }}>완료</span>
        </h1>
        <p>사용자님의 고유한 프로필을 바탕으로 최적의 퍼포먼스를 낼 수 있는 장비를 선정했습니다.</p>

        <div className="analysis-summary-chips" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '24px', maxWidth: '600px', margin: '24px auto 0' }}>
          {gender && <span className="chip">{gender}</span>}
          {purpose && <span className="chip">{purpose}</span>}
          {goal && <span className="chip">{goal}</span>}
          {budget && <span className="chip">{Number(budget).toLocaleString()}원 이하</span>}
        </div>
      </motion.header>

      <div className="product-grid">
        {products.map((item, index) => (
          <motion.div
            key={item.productId || index}
            className="product-card glass-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 6) * 0.1 }}
          >
            <div className="product-img-wrapper">
              <img src={item.image} alt={item.title} className="product-img" />
            </div>
            <div className="product-info">
              <h3 className="product-title" dangerouslySetInnerHTML={{ __html: item.title }} />
              <p className="product-price">{Number(item.lprice).toLocaleString()} <small>KRW</small></p>

              <div className="product-actions">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="product-btn btn-buy">
                  <ShoppingCart size={18} /> 구매하기
                </a>
                <button
                  onClick={() => handleWishlistClick(item)}
                  className={`product-btn btn-wish ${wishlist.has(item.productId) ? 'active' : ''}`}
                >
                  <Heart size={18} fill={wishlist.has(item.productId) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div ref={observerRef} style={{ height: "120px", display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {loading && <Loading inline={true} text="최적의 결과를 더 찾고 있습니다..." />}
        {!loading && products.length >= total && products.length > 0 && (
          <div className="end-of-results" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>개인 맞춤형 추천 결과의 끝에 도달했습니다.</p>
            <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '8px' }}>멈추지 말고 계속 달리세요!</p>
          </div>
        )}
      </div>

      <style>{`
        .chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .product-price small {
          font-size: 0.7em;
          margin-left: 4px;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default RecommendResult;