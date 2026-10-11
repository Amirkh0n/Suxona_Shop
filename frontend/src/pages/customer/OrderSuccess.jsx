import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircleIcon } from '../../components/Icons';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="order-success">
      <div className="order-success-icon">
        <CheckCircleIcon width={88} height={88} />
      </div>
      <h1 style={{ marginBottom: 'var(--sp-2)' }}>Buyurtma qabul qilindi!</h1>
      <p style={{ marginBottom: 'var(--sp-7)' }}>
        Buyurtmangiz do'kon tomonidan ko'rib chiqilmoqda. Holatni buyurtmalar bo'limidan kuzatib boring.
      </p>
      <button type="button" className="btn btn-outline btn-block" style={{ maxWidth: 320 }} onClick={() => navigate(`/buyurtma/${orderId}`)}>
        Buyurtmani ko'rish
      </button>
      <button type="button" className="btn btn-primary btn-block" style={{ maxWidth: 320, marginTop: 'var(--sp-3)' }} onClick={() => navigate('/buyurtmalarim')}>
        Buyurtmalarim
      </button>
    </div>
  );
}
