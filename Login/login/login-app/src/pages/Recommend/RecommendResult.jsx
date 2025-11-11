import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchRunningShoes } from "../../apis/naverShopping";
import styles from "../../assets/css/RecommendResult.module.css";

const RecommendResult = () => {
  const location = useLocation();
  const { gender, purpose, budget } =
    location.state || {};
  const [products, setProducts] = useState([]);
  const [start, setStart] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();
  const display = 9;

  const handleLoadMore = useCallback(() => {
    if (loading || products.length >= total) return;

    setLoading(true);
    const keyword = [gender, purpose, "러닝화"]
      .filter(Boolean)
      .join(" ");
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
  }, [
    loading,
    products.length,
    total,
    start,
    gender,
    purpose,
    budget,
  ]);

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
    // Reset and fetch initial data when conditions change
    setProducts([]);
    setStart(1);
    setTotal(0);
    setLoading(true);

    const keyword = [gender, purpose,  "러닝화"]
      .filter(Boolean)
      .join(" ");
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
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              구매하러 가기
            </a>
          </div>
        ))}
      </div>

      <div ref={observerRef} style={{ height: "20px" }} />
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default RecommendResult;