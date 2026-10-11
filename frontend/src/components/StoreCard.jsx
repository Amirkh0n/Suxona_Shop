import { Link } from 'react-router-dom';
import { StoreIcon } from './Icons';
import { resolveImageUrl } from '../utils/media';

export default function StoreCard({ store }) {
  return (
    <Link to={`/dokon/${store.id}`} className="card store-card">
      <div className="store-card-banner">
        {store.banner && <img src={resolveImageUrl(store.banner)} alt="" loading="lazy" />}
      </div>
      <div className="store-card-body">
        <div className="store-card-avatar">
          {store.logo ? <img src={resolveImageUrl(store.logo)} alt={store.name} /> : <StoreIcon width={20} height={20} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="store-card-name">{store.name}</div>
          {store.description && <div className="store-card-desc">{store.description}</div>}
        </div>
      </div>
    </Link>
  );
}
