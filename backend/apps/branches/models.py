from django.db import models

class Branch(models.Model): 
  name = models.CharField(max_length=100)

  BRANCH_TYPES = (
      ('kitchen', 'Full-Service Restaurant'),
      ('cafe_only', 'Resto Café (No Cooking)'),
  ) 

  branch_type = models.CharField(max_length=20, choices=BRANCH_TYPES) 
  
  address = models.TextField() 

  def __str__(self):
      return f"{self.name} ({self.branch_type})"

  
  
