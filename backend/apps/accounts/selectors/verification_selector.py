from apps.accounts.models import VerificationToken


class VerificationTokenSelector:
    @staticmethod
    def get_by_token(token: str) -> VerificationToken | None:
        return (
            VerificationToken.objects.filter(token=token)
            .select_related("user")
            .first()
        )

    @staticmethod
    def get_for_user(user_id) -> VerificationToken | None:
        return VerificationToken.objects.filter(user_id=user_id).first()
