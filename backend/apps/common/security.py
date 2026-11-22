"""Shared input-safety helpers."""

import re

from PIL import Image
from rest_framework import serializers

FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 40_000_000  # ~ 6000x6600; blocks decompression bombs


_NUMERIC = re.compile(r"^[+-]?\d[\d\s().,-]*$")


def csv_safe(value) -> str:
    """Neutralise spreadsheet formulas (CSV injection) in user-controlled text."""
    text = "" if value is None else str(value)
    if text.startswith(FORMULA_PREFIXES) and not _NUMERIC.match(text):  # numbers/phones are inert
        return "'" + text
    return text


class SafeImageField(serializers.ImageField):
    """ImageField with a size cap and a pixel cap checked *before* any decoding work."""

    def to_internal_value(self, data):
        size = getattr(data, "size", 0)
        if size and size > MAX_IMAGE_BYTES:
            raise serializers.ValidationError("Rasm hajmi 8 MB dan oshmasligi kerak.")
        file = super().to_internal_value(data)  # verifies it really is an image
        try:
            file.seek(0)
            with Image.open(file) as img:
                width, height = img.size
            file.seek(0)
        except (OSError, Image.DecompressionBombError) as exc:
            raise serializers.ValidationError("Rasm fayli yaroqsiz.") from exc
        if width * height > MAX_IMAGE_PIXELS:
            raise serializers.ValidationError("Rasm o'lchami juda katta.")
        return file
