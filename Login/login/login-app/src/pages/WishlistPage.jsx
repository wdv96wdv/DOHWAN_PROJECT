import React, { useEffect, useState } from 'react';
import { getWishlist, deleteWishlist } from '../apis/wishlist';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import "../assets/css/wishlist.css";
import "../assets/css/auth.css";
import Swal from 'sweetalert2';
import { Heart, ShoppingCart, Trash2, PackageSearch } from 'lucide-react';

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
      .then(data => {
        setWishlistItems(data);
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
      <header className="wishlist-header">
        <h1><Heart size={40} fill="var(--primary)" color="var(--primary)" style={{verticalAlign: 'middle', marginRight: '16px'}} /> MY WISHLIST</h1>
        <p>Manage your favorite running shoes and get ready for your next run.</p>
      </header>
      
      <div>
        {loading ? (
          <div className="empty-state">Loading your wishlist...</div>
        ) : wishlistItems.length > 0 ? (
          <div className="product-grid">
            {wishlistItems.map((item) => (
              <div key={item.productId} className="product-card">
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
            <button className="btn-auth" onClick={() => navigate('/recommend')} style={{marginTop: '24px'}}>FIND SHOES</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
