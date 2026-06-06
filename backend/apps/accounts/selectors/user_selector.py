from apps.accounts.models import User
from apps.common.enums import StoreApplicationStatus
from apps.stores.models import Store, StoreApplication


class UserSelector:
    @staticmethod
    def get_user_by_id(user_id) -> User | None:
        return User.objects.filter(pk=user_id).first()

    @staticmethod
    def get_user_by_phone(phone: str) -> User | None:
        return User.objects.filter(phone=phone).first()

    @staticmethod
    def user_has_store(user_id) -> bool:
        return Store.objects.filter(owner_id=user_id).exists()

    @staticmethod
    def user_has_pending_store_application(user_id) -> bool:
        return StoreApplication.objects.filter(
            owner_id=user_id,
            status=StoreApplicationStatus.PENDING,
        ).exists()
