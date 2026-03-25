from django.db import migrations


def create_default_categories(apps, schema_editor):
    """Ensure the two standard categories exist."""
    Category = apps.get_model('inventory', 'Category')
    
    for name in ['Raw Materials', 'Prepared Items']:
        Category.objects.get_or_create(name=name)


def reverse_categories(apps, schema_editor):
    """No-op reverse — keep categories."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0008_uompreset'),
    ]

    operations = [
        migrations.RunPython(create_default_categories, reverse_categories),
    ]
