from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_page, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('ships/', views.ships, name='ships'),
    path('ships/<str:ship_id>/', views.ship_detail, name='ship_detail'),
    path('components/', views.components, name='components'),
    path('jobs/', views.jobs, name='jobs'),
    path('calendar/', views.calendar_view, name='calendar'),
]
