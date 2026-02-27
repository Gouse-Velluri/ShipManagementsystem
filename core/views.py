from django.shortcuts import render

def login_page(request):
    return render(request, 'core/login.html')

def dashboard(request):
    return render(request, 'core/dashboard.html')

def ships(request):
    return render(request, 'core/ships.html')

def ship_detail(request, ship_id):
    return render(request, 'core/ship_detail.html', {'ship_id': ship_id})

def components(request):
    return render(request, 'core/components.html')

def jobs(request):
    return render(request, 'core/jobs.html')

def calendar_view(request):
    return render(request, 'core/calendar.html')
