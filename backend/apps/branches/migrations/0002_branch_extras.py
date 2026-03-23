from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='branch',
            name='contact_number',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='branch',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Inactive branches are hidden from dashboards'),
        ),
        migrations.AlterField(
            model_name='branch',
            name='address',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterModelOptions(
            name='branch',
            options={'ordering': ['name']},
        ),
    ]
