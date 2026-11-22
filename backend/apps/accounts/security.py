"""Account-security helpers: per-phone login lock-out and refresh-token revocation."""

from django.core.cache import cache
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

MAX_FAILURES = 5
LOCK_SECONDS = 15 * 60


def _key(phone: str) -> str:
    return f"login-fail:{phone.strip().lstrip('+')}"


def is_locked(phone: str) -> bool:
    return cache.get(_key(phone), 0) >= MAX_FAILURES


def register_failure(phone: str) -> None:
    """Count a failed login for this phone number, regardless of the caller's IP.

    The per-IP throttle stops one machine; this stops a botnet guessing a single
    account's password from many addresses.
    """
    key = _key(phone)
    cache.add(key, 0, LOCK_SECONDS)
    try:
        cache.incr(key)
    except ValueError:  # expired between add() and incr()
        cache.set(key, 1, LOCK_SECONDS)


def clear_failures(phone: str) -> None:
    cache.delete(_key(phone))


def revoke_all_tokens(user) -> int:
    """Blacklist every outstanding refresh token of ``user`` (password reset, logout-all)."""
    count = 0
    for token in OutstandingToken.objects.filter(user=user):
        _, created = BlacklistedToken.objects.get_or_create(token=token)
        count += created
    return count
