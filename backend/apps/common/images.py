"""Upload-time image optimisation."""

from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_SIDE = 1600
QUALITY = 82


def optimize_image(upload, *, max_side: int = MAX_SIDE):
    """Return a downscaled WebP ``ContentFile`` (EXIF-rotated); the original on any failure.

    Phone photos are often 4000px+ / several MB; serving them as-is makes the
    storefront slow. Failing open keeps uploads working for odd formats.
    """
    try:
        upload.seek(0)
        img = Image.open(upload)
        img = ImageOps.exif_transpose(img)
        img.thumbnail((max_side, max_side))
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
        buffer = BytesIO()
        img.save(buffer, format="WEBP", quality=QUALITY, method=4)
    except (UnidentifiedImageError, OSError, ValueError):
        upload.seek(0)
        return upload
    stem = (getattr(upload, "name", "image") or "image").rsplit(".", 1)[0]
    return ContentFile(buffer.getvalue(), name=f"{stem}.webp")
