from django.db import migrations


def populate_item_text_fields(apps, schema_editor):
    """Copy data from FK to text fields for existing DeliveryItem records."""
    DeliveryItem = apps.get_model('supply', 'DeliveryItem')
    
    for di in DeliveryItem.objects.select_related('item', 'item__category').all():
        if di.item_id:
            di.item_name = di.item.name
            di.item_sku = di.item.sku
            di.item_uom = di.item.uom
            di.item_category = di.item.category.name if di.item.category else ''
            di.save(update_fields=['item_name', 'item_sku', 'item_uom', 'item_category'])


def reverse_population(apps, schema_editor):
    """No-op reverse — we can't reliably restore FK from text."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('supply', '0004_alter_delivery_options_alter_deliveryitem_cost_and_more'),
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(populate_item_text_fields, reverse_population),
    ]
