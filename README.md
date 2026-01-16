# Pandemic Response Unit (PRU) - Technical Assessment

## 🚨 Mission Briefing

**To:** Lead Engineer, National Health Response Team  
**From:** Ministry of Health  
**Subject:** CRITICAL: Vaccine Allocation & ICU Monitoring System  
**Priority:** ALPHA-1

The pandemic has reached a critical phase. We are deploying a new field hospital network, but our digital infrastructure is failing under the load. We need you to fix the core systems immediately.

You have two primary objectives:

1.  **Secure the Vaccine Supply Chain**: Our inventory system is over-promising doses. We have exactly 500 doses of the new variant vaccine. Thousands of requests are hitting the server simultaneously. You must ensure we **never** promise a dose we don't have.
2.  **Stabilize the ICU Dashboard**: Doctors are complaining that their monitoring tablets are freezing. They need to see real-time patient vitals (Heart Rate, Oxygen) for 1,000 patients while typing shift notes. If the screen lags while they type, patients die.
# Pandemic Response Unit - Technical Assessment

## 🏥 Client Brief: St. Mungo's Hospital System

**Role**: Senior Full-Stack Engineer
**Duration**: 2 Hours

### Background
We have been contracted by St. Mungo's Hospital to fix critical issues in their "Pandemic Response Unit" system. The system was built hurriedly during the initial outbreak by a junior team and is now failing under the pressure of a new wave of cases.

The client reports three major problems that need immediate attention. Your task is to investigate the codebase, identify the root causes, and implement fixes while explaining your thought process.

### 🚨 Reported Issues

#### 1. "We are running out of vaccines unexpectedly!"
**Severity**: Critical
**Observation**: The hospital has a strict inventory of 500 vaccine doses. However, the administration reports that they often end up with more confirmed reservations than actual doses available.
**Impact**: Patients are showing up for appointments only to be turned away, causing chaos and bad PR.


#### 2. "The dashboard freezes when we have too many patients."
**Severity**: High
**Observation**: Doctors use the "ICU Live Monitor" to track patient vitals. It works fine with 50 patients, but when they simulate a surge (3,000+ patients), the entire browser tab freezes. They can't type in the "Shift Log" without severe lag.
**Impact**: Medical staff cannot work efficiently during emergencies.

#### 3. "The API slows down randomly."
**Severity**: Medium
**Observation**: Every time the system ingests a batch of patient vitals (via the `/ingest-vitals` endpoint), the entire API becomes unresponsive for a few seconds. Health check probes fail, and other requests time out.
**Impact**: System instability and potential data loss.


---

## 🛠️ System Architecture

- **Frontend**: React, Vite, TailwindCSS (running on port 5173)
- **Backend**: Node.js, Express, Socket.IO (running on port 3000)
- **Database**: PostgreSQL (running on port 5432)
- **Infrastructure**: Docker Compose

### Getting Started

1.  **Start the System**:
    ```bash
    docker-compose up --build
    ```
2.  **Access the App**:
    -   Frontend: [http://localhost:5173](http://localhost:5173)
    -   Backend: [http://localhost:3000](http://localhost:3000)

3.  **Verify Setup**:
    Run the included sanity check script to ensure everything is connected:
    *(Requires Node.js installed locally)*
    ```bash
    cd server && npm run verify
    ```
    *Alternatively, run it inside the container:*
    ```bash
    docker-compose exec backend npm run verify
    ```

### Interview Guidelines

-   **Think Out Loud**: We want to hear how you diagnose these problems.
-   **Code Quality**: Write clean, maintainable code.
-   **Tools**: You are free to use any AI Coding assistant or debugging tools you prefer.

---

