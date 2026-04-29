# ELD Trip Planner

## Overview

ELD Trip Planner is a full-stack application that simulates
FMCSA-compliant truck route planning and generates driver daily logs.

## Features

-   Route calculation using OSRM
-   HOS-compliant event simulation
-   Daily ELD log sheet generation
-   Interactive map visualization
-   Stops timeline (fuel, rest, pickup/drop)
-   Zoomable and pannable log sheet UI
-   Theme system (multiple UI designs)

## Tech Stack

### Backend

-   Django / FastAPI (depending on your setup)
-   OSRM (Open Source Routing Machine)
-   Custom HOSPlanner logic

### Frontend

-   React.js
-   Tailwind CSS
-   React Leaflet

## Setup

### Backend

``` bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

## API

POST /plan-trip

Example:

``` json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Indianapolis, IN",
  "dropoff_location": "Newark, NJ",
  "current_cycle_used": 10
}
```

## Architecture

-   TripPlanner → generates events
-   LogSheetBuilder → splits into daily logs
-   Frontend → renders logs + map

## Assumptions

-   11-hour driving limit
-   14-hour duty window
-   30-min break after 8 hours
-   10-hour reset
-   Fuel stop every 1000 miles
-   70-hour cycle

## Notes

-   Route data is real (OSRM)
-   ELD logs are simulated using rule-based logic

## Future Improvements

-   Real ELD API integration
-   Traffic-aware routing
-   Real fuel stop locations
-   Multi-driver support
