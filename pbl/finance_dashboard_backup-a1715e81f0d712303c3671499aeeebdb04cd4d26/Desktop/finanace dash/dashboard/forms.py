from django import forms
from .models import School, Hospital, ProfessionalApplication, Revenue, Expense, Budget, Transaction, Investment, UserActivityLog

class SchoolForm(forms.ModelForm):
    class Meta:
        model = School
        fields = ['name', 'location', 'student_count', 'budget']

class HospitalForm(forms.ModelForm):
    class Meta:
        model = Hospital
        fields = ['name', 'location', 'staff_count', 'budget']

class ProfessionalApplicationForm(forms.ModelForm):
    class Meta:
        model = ProfessionalApplication
        fields = ['applicant_name', 'application_date', 'status', 'notes']
        widgets = {
            'application_date': forms.DateInput(attrs={'type': 'date'}),
            'notes': forms.Textarea(attrs={'rows': 3}),
        }

class RevenueForm(forms.ModelForm):
    class Meta:
        model = Revenue
        fields = ['source', 'amount', 'date']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['category', 'amount', 'date', 'description']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }

class BudgetForm(forms.ModelForm):
    class Meta:
        model = Budget
        fields = ['category', 'allocated_amount', 'period_start', 'period_end']
        widgets = {
            'period_start': forms.DateInput(attrs={'type': 'date'}),
            'period_end': forms.DateInput(attrs={'type': 'date'}),
        }

class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ['description', 'amount', 'transaction_type', 'date']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }

class InvestmentForm(forms.ModelForm):
    class Meta:
        model = Investment
        fields = ['name', 'amount_invested', 'current_value', 'purchase_date']
        widgets = {
            'purchase_date': forms.DateInput(attrs={'type': 'date'}),
        }

class UserActivityLogForm(forms.ModelForm):
    class Meta:
        model = UserActivityLog
        fields = ['user', 'action']
