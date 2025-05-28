// Chart.js charts for dashboard index page

document.addEventListener('DOMContentLoaded', function () {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: [], // TODO: populate with dates or categories
            datasets: [{
                label: 'Revenue',
                data: [], // TODO: populate with revenue amounts
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: 'Amount ($)' }, beginAtZero: true }
            }
        }
    });

    // Expense Chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const expenseChart = new Chart(expenseCtx, {
        type: 'line',
        data: {
            labels: [], // TODO: populate with dates or categories
            datasets: [{
                label: 'Expenses',
                data: [], // TODO: populate with expense amounts
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: 'Amount ($)' }, beginAtZero: true }
            }
        }
    });

    // Budget Chart
    const budgetCtx = document.getElementById('budgetChart').getContext('2d');
    const budgetChart = new Chart(budgetCtx, {
        type: 'bar',
        data: {
            labels: [], // TODO: populate with budget categories or periods
            datasets: [{
                label: 'Budget Allocated',
                data: [], // TODO: populate with budget amounts
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Category' } },
                y: { display: true, title: { display: true, text: 'Amount ($)' }, beginAtZero: true }
            }
        }
    });

    // Transaction Chart
    const transactionCtx = document.getElementById('transactionChart').getContext('2d');
    const transactionChart = new Chart(transactionCtx, {
        type: 'line',
        data: {
            labels: [], // TODO: populate with dates or categories
            datasets: [{
                label: 'Transactions',
                data: [], // TODO: populate with transaction amounts
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: 'Amount ($)' }, beginAtZero: true }
            }
        }
    });

    // Investment Chart
    const investmentCtx = document.getElementById('investmentChart').getContext('2d');
    const investmentChart = new Chart(investmentCtx, {
        type: 'bar',
        data: {
            labels: [], // TODO: populate with investment names or categories
            datasets: [{
                label: 'Investment Value',
                data: [], // TODO: populate with investment values
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Investment' } },
                y: { display: true, title: { display: true, text: 'Value ($)' }, beginAtZero: true }
            }
        }
    });
});
