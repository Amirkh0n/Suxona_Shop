from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from apps.common.images import optimize_image


def _png(size):
    buf = BytesIO()
    Image.new("RGB", size, "red").save(buf, format="PNG")
    return SimpleUploadedFile("big.png", buf.getvalue(), content_type="image/png")


def test_large_image_is_downscaled_to_webp():
    out = optimize_image(_png((4000, 2000)))
    img = Image.open(out)
    assert out.name == "big.webp"
    assert img.format == "WEBP" and max(img.size) == 1600


def test_non_image_is_left_alone():
    junk = SimpleUploadedFile("x.png", b"not an image")
    assert optimize_image(junk) is junk
