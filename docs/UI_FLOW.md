# UI/UX Interaction Flow - Ecyce MediLink
> **Disclaimer:** This document provides a conceptual framework and initial context for project development. It is not a fixed set of rules and is subject to dynamic changes or iterations throughout the build process as new requirements arise.

## 1. User Portal Flow
### A. Landing Page
* [cite_start]Visual introduction to the Ecyce ecosystem and SDG 3/9/11 alignment[cite: 27, 29].
* Navigation to User Login or Product Information.

### B. Authentication Interface
* [cite_start]**Face ID Status:** Primary login via MediaPipe/ArcFace verification[cite: 60, 145].
* [cite_start]**Visual Feedback:** "Verified" status display with user profile name[cite: 174, 175].

### C. Pre-Medication (Data Ingestion)
* [cite_start]**Action:** Scan Prescription via webcam[cite: 57].
* [cite_start]**Process:** Real-time OCR extraction of medicine name, quantity, and time[cite: 61, 66].
* [cite_start]**Confirmation:** Manual web app confirmation/edit of the extracted schedule[cite: 69].

### D. Medication & Monitoring (Main Dashboard)
* [cite_start]**Health Overview:** Real-time display of Medicine Level (e.g., 85%)[cite: 159, 168].
* [cite_start]**Upcoming Dose:** Countdown timer for the next scheduled intake[cite: 170, 171].
* [cite_start]**Treatment Adherence:** Color-coded bar chart (On-time, Delayed, Missed)[cite: 176].
* [cite_start]**AI Health Companion:** Chat interface for symptom analysis and daily wellness tips[cite: 154, 184, 190].

## 2. Admin Portal Flow
### A. User Management Dashboard
* Overview of all registered users and their overall treatment adherence rates.
* [cite_start]Remote monitoring of patient symptoms summarized by Llama 3.2[cite: 115, 148].

### B. Hardware & Inventory Status
* [cite_start]**Hardware Monitoring:** Connection status (Heartbeat) of individual ESP32 nodes[cite: 49].
* [cite_start]**Tray Management:** Real-time visualization of tray levels (e.g., Tray 1: 18/40)[cite: 187, 188].
* [cite_start]**System Health:** Alerts for mechanical jams or low inventory[cite: 52, 205].    