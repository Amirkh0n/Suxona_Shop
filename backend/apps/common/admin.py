"""Shared admin utilities for SuxonaShop.

Provides reusable helpers for image thumbnails and colored status badges so
the per-app admin modules stay focused on configuration. This module defines
no model registrations; it is safe for admin autodiscovery to import.
"""

from __future__ import annotations

from django.utils.html import format_html

# --- Status badge colors -------------------------------------------------

ORDER_STATUS_COLORS = {
    "PENDING": "#f59e0b",
    "ACCEPTED": "#3b82f6",
    "DELIVERING": "#8b5cf6",
    "COMPLETED": "#10b981",
    "CANCELLED": "#6b7280",
    "REJECTED": "#ef4444",
}

STORE_STATUS_COLORS = {
    "PENDING": "#f59e0b",
    "ACTIVE": "#10b981",
    "SUSPENDED": "#ef4444",
    "REJECTED": "#6b7280",
}

STORE_APPLICATION_STATUS_COLORS = {
    "PENDING": "#f59e0b",
    "APPROVED": "#10b981",
    "REJECTED": "#ef4444",
}

PRODUCT_STATUS_COLORS = {
    "DRAFT": "#6b7280",
    "PENDING_REVIEW": "#3b82f6",
    "REJECTED": "#ef4444",
    "ACTIVE": "#10b981",
    "OUT_OF_STOCK": "#f59e0b",
    "HIDDEN": "#9ca3af",
}


def render_badge(label: str, color: str) -> str:
    """Return an HTML pill-style badge with the given label and color."""
    return format_html(
        '<span style="display:inline-block;padding:2px 10px;border-radius:10px;'
        'background:{};color:#fff;font-size:11px;font-weight:600;'
        'white-space:nowrap;">{}</span>',
        color,
        label,
    )


def render_status_badge(value: str, color_map: dict[str, str], display: str | None = None) -> str:
    """Render a status value as a colored badge using the given color map."""
    if not value:
        return "—"
    color = color_map.get(value, "#6b7280")
    return render_badge(display or value, color)


def render_bool_badge(
    value: bool, true_label: str = "Active", false_label: str = "Inactive"
) -> str:
    """Render a boolean as a green/red badge."""
    if value:
        return render_badge(true_label, "#10b981")
    return render_badge(false_label, "#9ca3af")


def render_thumbnail(image_field, height: int = 40) -> str:
    """Render an ImageField as a small thumbnail, or a dash if empty."""
    if not image_field:
        return "—"
    return format_html(
        '<img src="{}" style="height:{}px;width:auto;border-radius:4px;'
        'object-fit:cover;border:1px solid #e5e7eb;" />',
        image_field.url,
        height,
    )


def render_image_preview(image_field, max_height: int = 240) -> str:
    """Render a larger image preview for detail pages."""
    if not image_field:
        return "—"
    return format_html(
        '<img src="{}" style="max-height:{}px;max-width:100%;border-radius:8px;'
        'border:1px solid #e5e7eb;" />',
        image_field.url,
        max_height,
    )
