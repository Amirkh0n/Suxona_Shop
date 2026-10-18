import pytest
from django.urls import reverse

from apps.common.enums import StoreApplicationStatus
from apps.stores.models import Store
from apps.stores.services import ApproveStoreService, RejectStoreService

pytestmark = pytest.mark.django_db(transaction=True)


def test_approve_creates_store_audits_and_notifies(application, staff, sent):
    store = ApproveStoreService.execute(application=application, reviewed_by=staff)

    application.refresh_from_db()
    assert application.status == StoreApplicationStatus.APPROVED
    assert application.reviewed_by == staff
    assert application.reviewed_at is not None
    assert Store.objects.get(owner=application.owner) == store
    assert sent and sent[0][0] == "555" and "Baraka" in sent[0][1]


def test_reject_records_note_and_notifies(application, staff, sent):
    RejectStoreService.execute(application=application, admin_note="Hujjat yo'q", reviewed_by=staff)

    application.refresh_from_db()
    assert application.status == StoreApplicationStatus.REJECTED
    assert not Store.objects.filter(owner=application.owner).exists()
    assert "Hujjat yo'q" in sent[0][1]


def test_no_notification_without_linked_telegram(user, staff, sent):
    from apps.stores.models import StoreApplication

    app = StoreApplication.objects.create(owner=user, store_name="X", phone="+998900")
    ApproveStoreService.execute(application=app, reviewed_by=staff)
    assert sent == []


def test_admin_change_page_approve_button(client, application, staff, sent):
    client.force_login(staff)
    url = reverse("admin:stores_storeapplication_change", args=[application.pk])
    resp = client.post(
        url,
        {
            "owner": application.owner_id,
            "store_name": application.store_name,
            "phone": application.phone,
            "admin_note": "",
            "_approve": "1",
        },
    )
    assert resp.status_code == 302
    application.refresh_from_db()
    assert application.status == StoreApplicationStatus.APPROVED
    assert application.reviewed_by == staff
    assert Store.objects.filter(owner=application.owner).exists()


def test_admin_bulk_reject_action(client, application, staff, sent):
    client.force_login(staff)
    resp = client.post(
        reverse("admin:stores_storeapplication_changelist"),
        {"action": "reject_applications", "_selected_action": [application.pk]},
    )
    assert resp.status_code == 302
    application.refresh_from_db()
    assert application.status == StoreApplicationStatus.REJECTED


def test_change_page_shows_review_buttons_only_when_pending(client, application, staff):
    client.force_login(staff)
    url = reverse("admin:stores_storeapplication_change", args=[application.pk])
    html = client.get(url).content.decode()
    assert 'name="_approve"' in html and 'name="_reject"' in html

    ApproveStoreService.execute(application=application, reviewed_by=staff)
    html = client.get(url).content.decode()
    assert 'name="_approve"' not in html
