import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0001_initial'),
        ('menusAndRecipes', '0001_initial'),
        ('salesAndCatering', '0001_initial'),
    ]

    operations = [
        # 1. Remove the old sales OneToOne FK
        migrations.RemoveField(
            model_name='cateringevent',
            name='sales',
        ),
        # 2. Change event_date to DateField
        migrations.AlterField(
            model_name='cateringevent',
            name='event_date',
            field=models.DateField(),
        ),
        # 3. Update status choices + default
        migrations.AlterField(
            model_name='cateringevent',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('confirmed', 'Confirmed'),
                    ('completed', 'Completed'),
                    ('cancelled', 'Cancelled'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        # 4. Make prep_branch nullable
        migrations.AlterField(
            model_name='cateringevent',
            name='prep_branch',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='catering_prep_events',
                to='branches.branch',
            ),
        ),
        # 5. Add new scalar fields
        migrations.AddField(
            model_name='cateringevent',
            name='contact_number',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='venue',
            field=models.CharField(blank=True, default='', max_length=300),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='pax',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='package_type',
            field=models.CharField(
                choices=[
                    ('basic', 'Basic'),
                    ('silver', 'Silver'),
                    ('gold', 'Gold'),
                    ('premium', 'Premium'),
                    ('custom', 'Custom'),
                ],
                default='custom',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='notes',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='kitchen_sheet_number',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        # 6. Add M2M items_ordered
        migrations.AddField(
            model_name='cateringevent',
            name='items_ordered',
            field=models.ManyToManyField(
                blank=True,
                related_name='catering_events',
                to='menusAndRecipes.menuitem',
            ),
        ),
        # 7. Update Meta ordering
        migrations.AlterModelOptions(
            name='cateringevent',
            options={'ordering': ['-event_date', '-created_at']},
        ),
    ]
