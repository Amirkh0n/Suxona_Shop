"""Share pages with Open Graph tags.

The SPA is static (Cloudflare Pages), so link previews in Telegram / Instagram /
WhatsApp would be empty. Sharing ``<API>/share/products/<id>`` instead gives crawlers
real title/price/image, while humans are redirected to the app at once.
"""

from html import escape

from django.conf import settings
from django.http import Http404, HttpResponse

from apps.common.enums import ProductStatus, StoreStatus
from apps.products.models import Product
from apps.stores.models import Store


def _abs(url: str) -> str:
    return url if url.startswith("http") else f"{settings.SITE_BASE_URL}{url}"


def _page(*, title: str, description: str, image: str, target: str) -> HttpResponse:
    e = escape
    img = f'<meta property="og:image" content="{e(_abs(image))}">' if image else ""
    card = "summary_large_image" if image else "summary"
    html = f"""<!doctype html><html lang="uz"><head><meta charset="utf-8">
<title>{e(title)}</title>
<meta property="og:type" content="website"><meta property="og:site_name" content="SuxonaShop">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{e(target)}">{img}
<meta name="twitter:card" content="{card}">
<meta name="description" content="{e(description)}">
<link rel="canonical" href="{e(target)}">
<script>location.replace({target!r});</script></head>
<body><a href="{e(target)}">{e(title)}</a></body></html>"""
    response = HttpResponse(html, content_type="text/html; charset=utf-8")
    response["Cache-Control"] = "public, max-age=300"
    return response


def share_product(request, product_id: int):
    product = (
        Product.objects.filter(
            pk=product_id, status__in=(ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK)
        )
        .select_related("store")
        .prefetch_related("images")
        .first()
    )
    if product is None:
        raise Http404
    primary = next((i for i in product.images.all() if i.is_primary), None) or next(
        iter(product.images.all()), None
    )
    price = f"{int(product.price):,}".replace(",", " ")
    desc = f"{price} so'm · {product.store.name}"
    if product.description:
        desc += f" — {product.description[:140]}"
    return _page(
        title=product.name,
        description=desc,
        image=primary.image.url if primary else "",
        target=f"{settings.FRONTEND_BASE_URL}/mahsulot/{product.pk}",
    )


def share_store(request, store_id: int):
    store = Store.objects.filter(pk=store_id, status=StoreStatus.ACTIVE).first()
    if store is None:
        raise Http404
    return _page(
        title=store.name,
        description=(store.description or "SuxonaShop do'koni")[:200],
        image=store.logo.url if store.logo else "",
        target=f"{settings.FRONTEND_BASE_URL}/dokon/{store.pk}",
    )
