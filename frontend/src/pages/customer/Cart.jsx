import { useState } from 'react';
import { Link } from 'react-router-dom';
import { extractErrorMessage } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { formatSum } from '../../utils/format';
import { linePrice, variantLabel, availableStock } from '../../utils/variants';
import { resolveImageUrl } from '../../utils/media';
import { PageSpinner } from '../../components/Spinner';
import QuantityStepper from '../../components/QuantityStepper';
import { TrashIcon } from '../../components/Icons';

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [busyItem, setBusyItem] = useState(null);

  const stores = cart?.stores || [];

  const [itemError, setItemError] = useState('');

  const changeQty = async (item, qty) => {
    if (qty < 1) return;
    const limit = availableStock(item.product, item.variant);
    if (limit != null && qty > limit) {
      setItemError(`"${item.product?.name}" omborda faqat ${limit} dona bor.`);
      return;
    }
    setItemError('');
    setBusyItem(item.id);
    try {
      await updateItem(item.id, qty);
    } catch (err) {
      setItemError(extractErrorMessage(err, "Miqdorni o'zgartirib bo'lmadi."));
    } finally {
      setBusyItem(null);
    }
  };

  const remove = async (itemId) => {
    setBusyItem(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setBusyItem(null);
    }
  };

  const storeSubtotal = (group) =>
    (group.items || []).reduce((sum, item) => sum + linePrice(item) * item.quantity, 0);

  if (loading && !cart) return <PageSpinner />;

  if (stores.length === 0) {
    return (
      <div className="container page">
        <h1>Savat</h1>
        <div className="empty-state card">
          <h3>Savatingiz bo'sh</h3>
          <p>Xarid qilishni boshlash uchun mahsulotlarni ko'rib chiqing.</p>
          <Link to="/mahsulotlar" className="btn btn-primary">Xaridni boshlash</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page" style={{ paddingBottom: stores.length ? 100 : undefined }}>
      <h1>Savat</h1>
      {itemError && <div className="alert alert-error">{itemError}</div>}

      {stores.map((group) => {
        const items = group.items || [];
        return (
          <div key={group.store_id} className="card cart-store-group">
            <div className="cart-store-head">
              <Link to={`/dokon/${group.store_id}`}>{group.store_name}</Link>
              {items.length > 0 && (
                <Link to={`/rasmiylashtirish/${group.store_id}`} className="btn btn-primary btn-sm">
                  Buyurtma berish
                </Link>
              )}
            </div>

            {items.length === 0 ? (
              <p style={{ margin: 0 }}>Bu do'kondan mahsulot yo'q.</p>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <Link to={`/mahsulot/${item.product?.id}`} className="cart-item-main">
                      <div className="cart-item-media">
                        {item.product?.primary_image?.image && (
                          <img src={resolveImageUrl(item.product.primary_image.image)} alt="" />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="cart-item-name">{item.product?.name}</div>
                        {item.variant && <div className="cart-item-variant">{variantLabel(item.variant)}</div>}
                        <div className="cart-item-price">{formatSum(linePrice(item))}</div>
                      </div>
                    </Link>
                    <div className="cart-item-actions">
                      <QuantityStepper
                        value={item.quantity}
                        disabled={busyItem === item.id}
                        onChange={(q) => changeQty(item, q)}
                        size="sm"
                      />
                      <button type="button" className="cart-item-remove" disabled={busyItem === item.id} onClick={() => remove(item.id)} aria-label="O'chirish">
                        <TrashIcon width={18} height={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="cart-summary-row total">
                  <span>Jami</span>
                  <span>{formatSum(storeSubtotal(group))}</span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
