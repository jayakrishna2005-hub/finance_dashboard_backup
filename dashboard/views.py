from django.shortcuts import render, redirect
from django.views.generic import ListView, CreateView, UpdateView
from django.urls import reverse_lazy
from .models import School, Hospital, ProfessionalApplication
from .forms import SchoolForm, HospitalForm, ProfessionalApplicationForm
from django.db.models import Sum
from django.views.generic import ListView, CreateView, UpdateView
from django.urls import reverse_lazy
from .models import School, Hospital, ProfessionalApplication, Revenue, Expense, Budget, Transaction, Investment, UserActivityLog
from .forms import SchoolForm, HospitalForm, ProfessionalApplicationForm, RevenueForm, ExpenseForm, BudgetForm, TransactionForm, InvestmentForm, UserActivityLogForm

from django.db.models.functions import TruncMonth
from django.db.models import Sum
import json
import csv
from django.http import HttpResponse

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.mixins import LoginRequiredMixin

def home(request):
    return render(request, 'home.html')

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def login_view_new(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'new_login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

def export_expenses_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="expenses.csv"'

    writer = csv.writer(response)
    writer.writerow(['Category', 'Amount', 'Date', 'Description'])

    expenses = Expense.objects.all().values_list('category', 'amount', 'date', 'description')
    for expense in expenses:
        writer.writerow(expense)

    return response

def export_expenses_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="expenses.csv"'

    writer = csv.writer(response)
    writer.writerow(['Category', 'Amount', 'Date', 'Description'])

    expenses = Expense.objects.all().values_list('category', 'amount', 'date', 'description')
    for expense in expenses:
        writer.writerow(expense)

    return response

class SchoolListView(ListView):
    model = School
    template_name = 'school_list.html'
    context_object_name = 'schools'

class SchoolCreateView(CreateView):
    model = School
    form_class = SchoolForm
    template_name = 'school_form.html'
    success_url = reverse_lazy('school_list')

class SchoolUpdateView(UpdateView):
    model = School
    form_class = SchoolForm
    template_name = 'school_form.html'
    success_url = reverse_lazy('school_list')

class HospitalListView(ListView):
    model = Hospital
    template_name = 'hospital_list.html'
    context_object_name = 'hospitals'

class HospitalCreateView(CreateView):
    model = Hospital
    form_class = HospitalForm
    template_name = 'hospital_form.html'
    success_url = reverse_lazy('hospital_list')

class HospitalUpdateView(UpdateView):
    model = Hospital
    form_class = HospitalForm
    template_name = 'hospital_form.html'
    success_url = reverse_lazy('hospital_list')

class ProfessionalApplicationListView(LoginRequiredMixin, ListView):
    model = ProfessionalApplication
    template_name = 'professional_application_list.html'
    context_object_name = 'applications'

class ProfessionalApplicationCreateView(LoginRequiredMixin, CreateView):
    model = ProfessionalApplication
    form_class = ProfessionalApplicationForm
    template_name = 'professional_application_form.html'
    success_url = reverse_lazy('professional_application_list')

class ProfessionalApplicationUpdateView(LoginRequiredMixin, UpdateView):
    model = ProfessionalApplication
    form_class = ProfessionalApplicationForm
    template_name = 'professional_application_form.html'
    success_url = reverse_lazy('professional_application_list')

# New views for financial dashboard enhancements

class RevenueListView(LoginRequiredMixin, ListView):
    model = Revenue
    template_name = 'revenue_list.html'
    context_object_name = 'revenues'

class RevenueCreateView(LoginRequiredMixin, CreateView):
    model = Revenue
    form_class = RevenueForm
    template_name = 'revenue_form.html'
    success_url = reverse_lazy('revenue_list')

class RevenueUpdateView(LoginRequiredMixin, UpdateView):
    model = Revenue
    form_class = RevenueForm
    template_name = 'revenue_form.html'
    success_url = reverse_lazy('revenue_list')

class ExpenseListView(LoginRequiredMixin, ListView):
    model = Expense
    template_name = 'expense_list.html'
    context_object_name = 'expenses'

class ExpenseCreateView(LoginRequiredMixin, CreateView):
    model = Expense
    form_class = ExpenseForm
    template_name = 'expense_form.html'
    success_url = reverse_lazy('expense_list')

class ExpenseUpdateView(LoginRequiredMixin, UpdateView):
    model = Expense
    form_class = ExpenseForm
    template_name = 'expense_form.html'
    success_url = reverse_lazy('expense_list')

class BudgetListView(LoginRequiredMixin, ListView):
    model = Budget
    template_name = 'budget_list.html'
    context_object_name = 'budgets'

class BudgetCreateView(LoginRequiredMixin, CreateView):
    model = Budget
    form_class = BudgetForm
    template_name = 'budget_form.html'
    success_url = reverse_lazy('budget_list')

class BudgetUpdateView(LoginRequiredMixin, UpdateView):
    model = Budget
    form_class = BudgetForm
    template_name = 'budget_form.html'
    success_url = reverse_lazy('budget_list')

class TransactionListView(LoginRequiredMixin, ListView):
    model = Transaction
    template_name = 'transaction_list.html'
    context_object_name = 'transactions'

class TransactionCreateView(LoginRequiredMixin, CreateView):
    model = Transaction
    form_class = TransactionForm
    template_name = 'transaction_form.html'
    success_url = reverse_lazy('transaction_list')

class TransactionUpdateView(LoginRequiredMixin, UpdateView):
    model = Transaction
    form_class = TransactionForm
    template_name = 'transaction_form.html'
    success_url = reverse_lazy('transaction_list')

class InvestmentListView(LoginRequiredMixin, ListView):
    model = Investment
    template_name = 'investment_list.html'
    context_object_name = 'investments'

class InvestmentCreateView(LoginRequiredMixin, CreateView):
    model = Investment
    form_class = InvestmentForm
    template_name = 'investment_form.html'
    success_url = reverse_lazy('investment_list')

class InvestmentUpdateView(LoginRequiredMixin, UpdateView):
    model = Investment
    form_class = InvestmentForm
    template_name = 'investment_form.html'
    success_url = reverse_lazy('investment_list')

class UserActivityLogListView(LoginRequiredMixin, ListView):
    model = UserActivityLog
    template_name = 'user_activity_log_list.html'
    context_object_name = 'logs'

class UserActivityLogCreateView(LoginRequiredMixin, CreateView):
    model = UserActivityLog
    form_class = UserActivityLogForm
    template_name = 'user_activity_log_form.html'
    success_url = reverse_lazy('user_activity_log_list')

class UserActivityLogUpdateView(LoginRequiredMixin, UpdateView):
    model = UserActivityLog
    form_class = UserActivityLogForm
    template_name = 'user_activity_log_form.html'
    success_url = reverse_lazy('user_activity_log_list')

