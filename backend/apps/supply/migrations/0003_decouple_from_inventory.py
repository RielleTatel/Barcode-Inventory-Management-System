from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('supply', '0002_upgrade_supplier_delivery'),
    ]

    operations = [
        # Add new text fields to DeliveryItem
        migrations.AddField(
            model_name='deliveryitem',
            name='item_name',
            field=models.CharField(max_length=200, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='deliveryitem',
            name='item_sku',
            field=models.CharField(max_length=50, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='deliveryitem',
            name='item_uom',
            field=models.CharField(max_length=20, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='deliveryitem',
            name='item_category',
            field=models.CharField(max_length=100, blank=True, default=''),
        ),
        
        # Remove FK constraint and make item nullable temporarily
        migrations.AlterField(
            model_name='deliveryitem',
            name='item',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name='delivery_items',
                to='inventory.inventoryitem'
            ),
        ),
        
        # Remove unique_together that included item FK
        migrations.AlterUniqueTogether(
            name='deliveryitem',
            unique_together=set(),
        ),
    ]
