
<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&pause=1000&color=00B4D8&center=true&vCenter=true&width=700&lines=Maritime+Vessel+Tracking+Platform;Live+AIS+Tracking+%7C+Port+Analytics+%7C+Safety+Overlays" alt="Typing SVG" />

<br/>

![Python](https://img.shields.io/badge/Python-46.7%25-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-32.9%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-19.4%25-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-1.0%25-E34F26?style=for-the-badge&logo=html5&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-00B4D8?style=for-the-badge)
![Contributors](https://img.shields.io/badge/Contributors-3-0077B6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-48CAE4?style=for-the-badge)

<br/>

> **A full-stack web platform for interactive live vessel tracking, cargo classification, port congestion analytics, and safety overlays — powered by open maritime and weather data sources.**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Data Sources](#data-sources)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

<img align="right" width="300" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/AIS_TRANSPONDERS_MAP.jpg/640px-AIS_TRANSPONDERS_MAP.jpg" alt="AIS Map"/>

The **Maritime Vessel Tracking Platform** is a collaborative full-stack application built to bring real-time situational awareness to maritime operations. It leverages publicly available AIS (Automatic Identification System) data combined with open weather and oceanographic sources to present a unified, interactive dashboard that operators, researchers, and port authorities can use to monitor global vessel activity.

The system covers four critical domains of maritime intelligence: live position tracking of vessels anywhere on the globe, intelligent classification of cargo types, congestion analytics for major world ports, and dynamic safety overlays that factor in weather conditions and navigational hazards. By integrating multiple data streams into a single interface, the platform reduces the friction of maritime situational awareness and makes professional-grade monitoring accessible from any browser.

This project was developed as part of a structured team effort under **Springboard Mentorship**, with contributions from three developers who collaborated across the backend Python core and the JavaScript-driven frontend.

---

## Features

### Live Vessel Tracking
The platform connects to open AIS data streams and plots vessel positions in real time on an interactive map. Users can click any vessel to view detailed telemetry including MMSI number, speed over ground (SOG), course over ground (COG), heading, vessel type, flag state, and destination port. The map updates continuously, giving operators a living picture of maritime traffic across any ocean or coastal area.

### Cargo Classification
Vessels are automatically classified by cargo type based on AIS vessel type codes and supplementary data. The classification engine distinguishes between tankers, bulk carriers, container ships, passenger vessels, fishing vessels, and other categories — rendering each with a distinct visual marker and color code on the map. This allows users to filter the traffic view by cargo type and understand the commercial character of any maritime zone at a glance.

### Port Congestion Analytics
The analytics module aggregates vessel density and anchorage data around major global ports to produce a congestion index. Users can inspect individual ports through a detail panel that shows inbound and outbound vessel counts, average waiting times at anchor, and a historical trend chart of congestion levels. This feature is particularly useful for logistics planners, shipping companies, and port authority operations centers.

### Safety Overlays
The safety layer brings in open weather data — wind speed and direction, wave height, visibility, and storm warnings — and overlays it directly onto the vessel tracking map. Navigational hazard zones, restricted areas, and Traffic Separation Schemes (TSS) are also rendered as polygon overlays. When a vessel enters a flagged zone, the system highlights the crossing, giving operators an early warning mechanism for potential incidents.

---

## Technology Stack

### Backend — `core/`

The backend is written entirely in **Python** and is responsible for data ingestion, processing, classification logic, and serving the REST API consumed by the frontend. Python's ecosystem for geospatial computation and data processing makes it an ideal choice for the kinds of transformations this platform requires.

| Component | Technology |
|---|---|
| Language | Python 3.x |
| Web Framework | Django / Flask / FastAPI |
| AIS Data Processing | pyais, pandas |
| Geospatial Operations | shapely, geopandas |
| REST API | Django REST Framework / FastAPI |
| Scheduling & Data Refresh | APScheduler / Celery |

### Frontend — `frontend/`

The frontend is built with **JavaScript**, **CSS**, and **HTML**, delivering a responsive, browser-based dashboard. The map interface is powered by a JavaScript mapping library that renders real-time vessel positions, overlays, and analytics panels without requiring page reloads.

| Component | Technology |
|---|---|
| Language | JavaScript (ES6+) |
| Map Rendering | Leaflet.js / Mapbox GL |
| UI Styling | Custom CSS |
| HTTP Client | Fetch API / Axios |
| Charts & Analytics | Chart.js / D3.js |

---

## Project Structure

```
Maritime-Vessel-Tracking-Team-2/
│
├── core/                        # Python backend
│   ├── api/                     # REST API endpoints and routing
│   ├── tracking/                # AIS ingestion and vessel position logic
│   ├── classification/          # Cargo type classification engine
│   ├── analytics/               # Port congestion calculations
│   ├── safety/                  # Weather and hazard overlay data
│   ├── models.py                # Data models and schemas
│   ├── settings.py              # Configuration and environment variables
│   └── requirements.txt         # Python dependencies
│
├── frontend/                    # JavaScript / CSS / HTML frontend
│   ├── index.html               # Application entry point
│   ├── js/                      # JavaScript modules and logic
│   │   ├── map.js               # Interactive map initialization and layers
│   │   ├── vessels.js           # Vessel data fetching and rendering
│   │   ├── analytics.js         # Port congestion charts and panels
│   │   └── overlays.js          # Safety and weather overlay logic
│   ├── css/                     # Stylesheets
│   │   └── main.css             # Primary styles and theming
│   └── assets/                  # Icons, images, and static resources
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

Before running the platform locally, make sure you have the following installed on your machine:

- **Python 3.9 or higher** — required for the backend core
- **Node.js and npm** (optional) — if the frontend uses a build step
- **Git** — for cloning the repository
- A modern web browser (Chrome, Firefox, Edge)

### Clone the Repository

```bash
git clone https://github.com/springboardmentor0316/Maritime-Vessel-Tracking-Team-2.git
cd Maritime-Vessel-Tracking-Team-2
```

---

## Backend Setup

Navigate into the core directory and set up a Python virtual environment to keep dependencies isolated from your system Python installation.

```bash
cd core
python -m venv venv
```

Activate the virtual environment:

```bash
# On macOS / Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

Install all required Python packages:

```bash
pip install -r requirements.txt
```

Configure your environment variables. Copy the example environment file and fill in the required values such as API keys for AIS data and weather services:

```bash
cp .env.example .env
```

Apply database migrations if the project uses a relational database:

```bash
python manage.py migrate
```

Start the backend development server:

```bash
python manage.py runserver
```

The API will be accessible at `http://localhost:8000` by default.

---

## Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

If the frontend uses a build tool, install dependencies and start the development server:

```bash
npm install
npm start
```

If the frontend is a plain HTML/CSS/JS application with no build step, you can serve it directly using Python's built-in HTTP server:

```bash
python -m http.server 3000
```

Then open your browser and navigate to `http://localhost:3000`.

---

## Data Sources

The platform is built on open and publicly accessible maritime and environmental data. The key data sources integrated into the system include:

| Source | Description |
|---|---|
| **AISHub / AIS Stream** | Open real-time AIS position reports from vessels worldwide |
| **OpenSeaMap** | Open-source nautical chart tiles and maritime geographic data |
| **Open-Meteo / OpenWeatherMap** | Open weather APIs providing wind, wave, and storm data |
| **MarineTraffic (free tier)** | Supplementary vessel metadata and port information |
| **World Port Index** | Reference data for global port locations and characteristics |

No proprietary data subscriptions are required to run the platform in its default configuration, making it accessible for educational and research use.

---

## Contributing

Contributions to this project are welcome. To contribute:

1. Fork the repository on GitHub.
2. Create a new feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear, descriptive commit messages.
4. Push your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against the `main` branch and describe what your change does and why.

Please ensure that any new Python code follows PEP 8 style guidelines and that any JavaScript code is kept modular and well-commented. Bug reports and feature requests can be submitted via the [Issues](https://github.com/springboardmentor0316/Maritime-Vessel-Tracking-Team-2/issues) tab.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for full terms. You are free to use, modify, and distribute this software for personal, academic, or commercial purposes with appropriate attribution.

---

<div align="center">

Built with care by **Team 2** under the Springboard Mentorship Program.

![Python](https://img.shields.io/badge/Made%20with-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![JS](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![MIT](https://img.shields.io/badge/License-MIT-00B4D8?style=flat-square)

</div>
