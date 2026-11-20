import pytest
from django.contrib.auth.models import Group
from django.core.management import call_command

pytestmark = pytest.mark.django_db


def _codenames(group_name):
    return set(Group.objects.get(name=group_name).permissions.values_list("codename", flat=True))


def test_roles_are_created_with_expected_permissions():
    call_command("setup_admin_roles")
    assert {g.name for g in Group.objects.all()} >= {"Moderator", "Support", "Marketing", "Auditor"}

    moderator = _codenames("Moderator")
    assert {"change_product", "change_storeapplication", "change_productreview"} <= moderator
    assert "delete_product" not in moderator and "change_order" not in moderator

    support = _codenames("Support")
    assert "change_order" in support and "change_product" not in support

    auditor = _codenames("Auditor")
    assert auditor and all(c.startswith("view_") for c in auditor)
    assert "view_auditlog" in auditor


def test_command_is_idempotent_and_repairs_drift():
    call_command("setup_admin_roles")
    group = Group.objects.get(name="Support")
    group.permissions.clear()
    call_command("setup_admin_roles")
    call_command("setup_admin_roles")
    assert "change_order" in _codenames("Support")
    assert Group.objects.filter(name="Support").count() == 1


def test_moderator_can_open_product_admin_but_not_orders(client):
    from django.contrib.auth import get_user_model

    call_command("setup_admin_roles")
    staff_user = get_user_model().objects.create_user(
        phone="+998901111111", password="pw12345678", is_staff=True, is_active=True
    )
    staff_user.groups.add(Group.objects.get(name="Moderator"))
    client.force_login(staff_user)
    assert client.get("/admin/products/product/").status_code == 200
    assert client.get("/admin/orders/order/").status_code == 403
