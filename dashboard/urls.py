from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.login_view_new, name='new_login'),
    path('login/', views.login_view_new, name='new_login'),
    path('logout/', views.logout_view, name='logout'),
    path('home/', views.home, name='home'),
    # path('accounts/', include('django.contrib.auth.urls')),
    # path('login/', views.login_view, name='login'),
    # path('logout/', views.logout_view, name='logout'),

    # School URLs
    path('schools/', views.SchoolListView.as_view(), name='school_list'),
    path('schools/add/', views.SchoolCreateView.as_view(), name='school_add'),
    path('schools/edit/<int:pk>/', views.SchoolUpdateView.as_view(), name='school_edit'),

    # Hospital URLs
    path('hospitals/', views.HospitalListView.as_view(), name='hospital_list'),
    path('hospitals/add/', views.HospitalCreateView.as_view(), name='hospital_add'),
    path('hospitals/edit/<int:pk>/', views.HospitalUpdateView.as_view(), name='hospital_edit'),

    # Professional Application URLs
    path('applications/', views.ProfessionalApplicationListView.as_view(), name='professional_application_list'),
    path('applications/add/', views.ProfessionalApplicationCreateView.as_view(), name='professional_application_add'),
    path('applications/edit/<int:pk>/', views.ProfessionalApplicationUpdateView.as_view(), name='professional_application_edit'),

    # Revenue URLs
    path('revenues/', views.RevenueListView.as_view(), name='revenue_list'),
    path('revenues/add/', views.RevenueCreateView.as_view(), name='revenue_add'),
    path('revenues/edit/<int:pk>/', views.RevenueUpdateView.as_view(), name='revenue_edit'),

    # Expense URLs
    path('expenses/', views.ExpenseListView.as_view(), name='expense_list'),
    path('expenses/add/', views.ExpenseCreateView.as_view(), name='expense_add'),
    path('expenses/edit/<int:pk>/', views.ExpenseUpdateView.as_view(), name='expense_edit'),
    path('expenses/export/', views.export_expenses_csv, name='expense_export'),

    # Budget URLs
    path('budgets/', views.BudgetListView.as_view(), name='budget_list'),
    path('budgets/add/', views.BudgetCreateView.as_view(), name='budget_add'),
    path('budgets/edit/<int:pk>/', views.BudgetUpdateView.as_view(), name='budget_edit'),

    # Transaction URLs
    path('transactions/', views.TransactionListView.as_view(), name='transaction_list'),
    path('transactions/add/', views.TransactionCreateView.as_view(), name='transaction_add'),
    path('transactions/edit/<int:pk>/', views.TransactionUpdateView.as_view(), name='transaction_edit'),

    # Investment URLs
    path('investments/', views.InvestmentListView.as_view(), name='investment_list'),
    path('investments/add/', views.InvestmentCreateView.as_view(), name='investment_add'),
    path('investments/edit/<int:pk>/', views.InvestmentUpdateView.as_view(), name='investment_edit'),

    # User Activity Log URLs
    path('user-activity-logs/', views.UserActivityLogListView.as_view(), name='user_activity_log_list'),
    path('user-activity-logs/add/', views.UserActivityLogCreateView.as_view(), name='user_activity_log_add'),
    path('user-activity-logs/edit/<int:pk>/', views.UserActivityLogUpdateView.as_view(), name='user_activity_log_edit'),

    # Django auth URLs for login/logout
    path('accounts/', include('django.contrib.auth.urls')),
]
