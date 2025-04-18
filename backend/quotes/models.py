from django.db import models

# ROOF_TYPES = [
#     ("Metal", "Metal"),
#     ("TPO", "TPO"),
#     ("Foam", "Foam"),
#     ("EPDM", "EPDM"),
#     ("Built-up", "Built-up"),
#     ("Modified Bitumen", "Modified Bitumen"),
#     ("PVC", "PVC"),
#     ("Other", "Other"),
# ]
ROOF_TYPES = [
    ("METAL", "Metal"),
    ("TPO", "TPO"),
    ("FOAM", "Foam"),
    ("EPDM", "EPDM"),
    ("BUILT-UP", "Built-up"),
    ("MODIFIED BITUMEN", "Modified Bitumen"),
    ("PVC", "PVC"),
    ("OTHER", "Other"),
]
class Quote(models.Model):
    contractor_name = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    roof_size = models.IntegerField()
    roof_type = models.CharField(max_length=50, choices=ROOF_TYPES)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    project_date = models.DateField()

    def save(self, *args, **kwargs):
        if self.roof_type:
            self.roof_type = self.roof_type.upper()
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.contractor_name} - {self.roof_type} - {self.state}"
