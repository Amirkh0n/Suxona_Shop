import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatSum } from '../utils/format';
import { HeartIcon, PlusIcon, CheckCircleIcon } from './Icons';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../utils/media';

export default function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const image = resolveImageUrl(product.primary_image?.image);
  const outOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const favorite = isFavorite(product.id);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || added) return;
    if (!user) {
      navigate('/kirish', { state: { from: { pathname: `/mahsulot/${product.id}` } } });
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // Keep the card silent on failure — the shopper can still retry, or
      // open the product page where a proper error message is shown.
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/mahsulot/${product.id}`} className="card product-card">
      <div className="product-card-media">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">{product.name?.[0]?.toUpperCase()}</div>
        )}
        <button
          type="button"
          className={`product-card-fav${favorite ? ' active' : ''}`}
          aria-label={favorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}
        >
          <HeartIcon filled={favorite} width={16} height={16} />
        </button>
        {outOfStock && <span className="badge badge-cancelled product-card-stock-badge">Tugagan</span>}
        {!outOfStock && (
          <button
            type="button"
            className={`product-card-add${added ? ' added' : ''}`}
            aria-label="Savatga qo'shish"
            onClick={handleQuickAdd}
            disabled={adding}
          >
            {added ? <CheckCircleIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
          </button>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">{formatSum(product.price)}</div>
      </div>
    </Link>
  );
}
