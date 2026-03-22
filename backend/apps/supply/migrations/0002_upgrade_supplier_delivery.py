from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('supply', '0001_initial'),
    ]

    operations = [
        # ── Supplier additions ────────────────────────────────────────────────
        migrations.AddField(
            model_name='supplier',
            name='category',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='supplier',
            name='contact_person',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='supplier',
            name='phone',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='supplier',
            name='email',
            field=models.EmailField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='supplier',
            name='payment_terms',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='supplier',
            name='lead_time_days',
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='supplier',
            name='notes',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='supplier',
            name='is_archived',
            field=models.BooleanField(default=False),
        ),
        # Keep old contact_info but make it optional (for backwards compat)
        migrations.AlterField(
            model_name='supplier',
            name='contact_info',
            field=models.TextField(blank=True, default=''),
        ),

        # ── Delivery additions ────────────────────────────────────────────────
        migrations.AddField(
            model_name='delivery',
            name='received_by',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='delivery',
            name='notes',
            field=models.TextField(blank=True, default=''),
        ),
        # Make dr_number optional (it's optional in the new model)
        migrations.AlterField(
            model_name='delivery',
            name='dr_number',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        # Remove unique_together so dr_number can be blank
        migrations.AlterUniqueTogether(
            name='delivery',
            unique_together=set(),
        ),
    ]
