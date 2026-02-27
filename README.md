# MarineOps — Ship Maintenance System

Django serves the HTML pages. All data is stored in the browser's **localStorage** — no database required.

## Quick Start

```bash
pip install django
python manage.py runserver
```

Open http://127.0.0.1:8000
OPen https://shipmanagementsystem.onrender.com/

## Demo Login Credentials

| Role      | Email                    | Password    |
|-----------|--------------------------|-------------|
| Admin     | admin@entnt.in           | admin123    |
| Inspector | inspector@entnt.in       | inspect123  |
| Engineer  | engineer@entnt.in        | engine123   |

## Pages

| URL                 | Description                   |
|---------------------|-------------------------------|
| `/`                 | Login page                    |
| `/dashboard/`       | KPI dashboard & charts        |
| `/ships/`           | Fleet management              |
| `/ships/<id>/`      | Ship detail, components, jobs |
| `/components/`      | All components across fleet   |
| `/jobs/`            | Maintenance jobs with filters |
| `/calendar/`        | Monthly/weekly job calendar   |

## Features by Role

| Feature           | Admin | Inspector | Engineer |
|-------------------|-------|-----------|----------|
| View everything   | ✅    | ✅        | ✅       |
| Create/Edit ships | ✅    | ✗         | ✗        |
| Create jobs       | ✅    | ✅        | ✗        |
| Update job status | ✅    | ✅        | ✅       |
| Delete records    | ✅    | ✗         | ✗        |
