from django.db import models

class School(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    student_count = models.PositiveIntegerField()
    budget = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.name

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    staff_count = models.PositiveIntegerField()
    budget = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.name

class ProfessionalApplication(models.Model):
    applicant_name = models.CharField(max_length=255)
    application_date = models.DateField()
    status = models.CharField(max_length=50)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.applicant_name} - {self.status}"

# New models for financial dashboard enhancements

class Revenue(models.Model):
    source = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.source} - {self.amount}"

class Expense(models.Model):
    category = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.category} - {self.amount}"

class Budget(models.Model):
    category = models.CharField(max_length=255)
    allocated_amount = models.DecimalField(max_digits=15, decimal_places=2)
    period_start = models.DateField()
    period_end = models.DateField()

    def __str__(self):
        return f"{self.category} Budget"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    ]
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=6, choices=TRANSACTION_TYPES)
    date = models.DateField()

    def __str__(self):
        return f"{self.description} - {self.amount} ({self.transaction_type})"

class Investment(models.Model):
    name = models.CharField(max_length=255)
    amount_invested = models.DecimalField(max_digits=15, decimal_places=2)
    current_value = models.DecimalField(max_digits=15, decimal_places=2)
    purchase_date = models.DateField()

    def __str__(self):
        return self.name

class UserActivityLog(models.Model):
    user = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} at {self.timestamp}"
