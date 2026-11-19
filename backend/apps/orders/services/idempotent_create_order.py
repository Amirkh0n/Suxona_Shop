import hashlib
import re

from django.db import IntegrityError, transaction

from apps.accounts.models import Address, User
from apps.orders.exceptions import IdempotencyKeyReuseError, InvalidIdempotencyKeyError
from apps.orders.models import IdempotencyKey, Order
from apps.orders.services.create_order import CreateOrderService
from apps.stores.models import Store

_KEY_RE = re.compile(r"^[A-Za-z0-9_-]{8,128}$")


def _fingerprint(store: Store, address: Address | None, note: str, extra: tuple) -> str:
    raw = "|".join(map(str, (store.pk, address.pk if address else "-", note, *extra)))
    return hashlib.sha256(raw.encode()).hexdigest()


class IdempotentCreateOrderService:
    """Create an order at most once per ``(user, Idempotency-Key)``.

    Returns ``(order, created)``. ``created`` is False when an earlier request
    with the same key already produced the order (a retry / double click).

    Same key + different payload is a client bug and raises
    ``IdempotencyKeyReuseError``. The key row and the order are written in one
    transaction, so a failed checkout leaves nothing behind and the same key can
    be retried; concurrent duplicates serialize on the unique index.
    """

    @staticmethod
    def execute(
        *,
        key: str | None,
        customer: User,
        store: Store,
        address: Address | None = None,
        note: str = "",
        **order_options,
    ) -> tuple[Order, bool]:
        """``order_options``: delivery_method, contact_name, contact_phone."""
        if not key:
            order = CreateOrderService.execute(
                customer=customer, store=store, address=address, note=note, **order_options
            )
            return order, True

        if not _KEY_RE.match(key):
            raise InvalidIdempotencyKeyError()

        fingerprint = _fingerprint(store, address, note, tuple(sorted(order_options.items())))

        with transaction.atomic():
            try:
                with transaction.atomic():  # savepoint: IntegrityError stays local
                    record = IdempotencyKey.objects.create(
                        user=customer, key=key, request_hash=fingerprint
                    )
            except IntegrityError:
                record = IdempotencyKey.objects.select_for_update().get(
                    user=customer, key=key
                )
                if record.request_hash != fingerprint:
                    raise IdempotencyKeyReuseError() from None
                if record.order_id is None:  # pragma: no cover - needs a crash mid-commit
                    raise IdempotencyKeyReuseError() from None
                return record.order, False

            order = CreateOrderService.execute(
                customer=customer, store=store, address=address, note=note, **order_options
            )
            record.order = order
            record.save(update_fields=["order", "updated_at"])
            return order, True
