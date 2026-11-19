import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../../api/endpoints';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/Skeleton';

export default function Favorites() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState(null);

  // Reload when the set changes so un-hearting removes the card.
  useEffect(() => {
    favoriteApi.list().then(({ data }) => setProducts(data.results || [])).catch(() => setProducts([]));
  }, [ids.length]);

  return (
    <div className="container page">
      <h1>Sevimlilar</h1>
      {products === null ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <h3>Sevimli mahsulotlar yo'q</h3>
          <p>Mahsulot kartasidagi yurakchani bosing.</p>
          <Link to="/mahsulotlar" className="btn btn-primary">Mahsulotlarga o'tish</Link>
        </div>
      ) : (
        <div className="grid grid-products">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
