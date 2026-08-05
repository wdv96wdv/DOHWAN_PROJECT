import React, { useEffect, useState } from 'react';
import { getWishlist, deleteWishlist } from '../apis/wishlist';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import "../assets/css/wishlist.css";
import "../assets/css/auth.css";
import Swal from 'sweetalert2';
import { Heart, ShoppingCart, Trash2, PackageSearch } from 'lucide-react';
import Loading from '../components/Common/Loading';
import { Helmet } from 'react-helmet-async';

const WishlistPage = () => {
  const userInfo = useAuthStore(state => state.userInfo);
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to use the wishlist.',
        confirmButtonColor: 'var(--primary)',
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    setLoading(true);
    getWishlist()
      .then(res => {
        const items = res.data || [];
        setWishlistItems(items);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch wishlist:", error);
        setLoading(false);
      });
  }, [userInfo, navigate]);

  const handleDeleteWishlistItem = async (productId) => {
    try {
      await deleteWishlist(productId);
      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
    } catch (error) {
      console.error("Error deleting from wishlist:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update wishlist.',
      });
    }
  };

  return (
    <div className="wishlist-page">
      <Helmet>
        <title>Dorunning | 위시리스트</title>
        <meta name="description" content="찜해둔 러닝화 목록을 확인하고 관리하세요. 나만의 최적 기어를 잊지 말고 챙기세요." />
        <meta property="og:title" content="Dorunning | 위시리스트" />
      </Helmet>
      <header className="wishlist-header">
        <h1><Heart size={40} fill="var(--primary)" color="var(--primary)" style={{verticalAlign: 'middle', marginRight: '16px'}} /> MY WISHLIST</h1>
        <p>Manage your favorite running shoes and get ready for your next run.</p>
      </header>
      
      <div>
        {loading ? (
          <Loading inline={true} text="찜 목록을 불러오는 중..." />
        ) : wishlistItems.length > 0 ? (
          <div className="product-grid">
            {wishlistItems.map((item) => (
              <div key={item.productId} className="product-card glass-card">
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
                      onClick={() => handleDeleteWishlistItem(item.productId)}
                      className="product-btn btn-wish active"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <PackageSearch size={64} style={{margin: '0 auto 24px', display: 'block'}} />
            <p>Your wishlist is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
