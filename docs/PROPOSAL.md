# Ecyce MediLink - Smart Medicine Box
> **Disclaimer:** This document provides a conceptual framework and initial context for project development. It is not a fixed set of rules and is subject to dynamic changes or iterations throughout the build process as new requirements arise.
[cite_start]**Project Subtitle:** Innovations for a Healthier Future [cite: 2]
[cite_start]**Team:** Team Ecyce (Ven Gia Nghia, Huynh Trong Khiem, Truong Gia Bao, Nguyen Ngoc Thien Ngan) [cite: 3, 4, 5, 6, 7]
[cite_start]**Competition:** NEO LEAGUE SEASON 2: INNOVATION HUMANITY CHALLENGE [cite: 8]

---

## 1. Project Introduction & Problem Definition
### The Challenge
* [cite_start]Vietnam is among the world's fastest-aging societies[cite: 13].
* [cite_start]Approximately 30% of seniors live alone, lacking daily medical supervision[cite: 14].
* [cite_start]Patients manage 10-15 pills daily, leading to massive cognitive overload[cite: 17].
* [cite_start]There is a 50% non-adherence rate in chronic disease treatment[cite: 18].
* [cite_start]Impact: High medical anxiety, frequent dosage errors, and preventable hospitalizations[cite: 15, 21].

### The Solution: Ecyce MediLink
* [cite_start]An empathetic IoT ecosystem transforming elderly medication adherence through Edge AI and human-centric automation[cite: 11].
* [cite_start]Eliminates human error and provides real-time supervision through an advanced IoT architecture[cite: 23].

---

## [cite_start]2. Core Features & Innovation [cite: 40]
* [cite_start]**OCR-Driven Intake:** Users scan physical prescriptions via webcam/phone; the system uses OCR and AI to automatically interpret dosage instructions and create a schedule[cite: 42].
* [cite_start]**Automatic Dispensing:** Custom hardware ensures the correct pills are delivered at the scheduled time without manual sorting[cite: 43].
* [cite_start]**Facial Recognition:** Allows multiple users to use the box simultaneously while ensuring the right person gets the right medicine[cite: 44, 60].
* [cite_start]**AI Health Companion:** Includes a Large Language Model (LLM) for patients to discuss daily symptoms and receive wellness tips[cite: 45, 154].

---

## 3. Technical Architecture
### Hardware Infrastructure
* [cite_start]**Edge AI Hub (Laptop/Workstation):** (Replaces Raspberry Pi 4 for high-performance processing) Handles Computer Vision (OCR & Face ID) and LLM voice interaction[cite: 47, 48].
* [cite_start]**Actuator Node (ESP32):** Receives commands via MQTT to drive Servo motors for autonomous dispensing[cite: 50, 51, 107].
* [cite_start]**Communication:** Uses MQTT (localhost or Cloud Broker) for stable, bidirectional, and network-independent communication[cite: 80, 81, 101, 104].

### [cite_start]Software & AI Stack [cite: 129]
* [cite_start]**OCR Engine:** Tesseract OCR 5 (Python) to extract medicine names, dosages, and intake times[cite: 131, 132, 134].
* [cite_start]**Face Recognition:** MediaPipe Face (BlazeFace) for detection and ArcFace (InsightFace) for verification[cite: 136, 144, 145].
* [cite_start]**LLM Model:** Llama 3.2 1B Instruct (Lightweight, real-time, and edge-friendly) for symptom analysis and Q&A[cite: 142, 143, 148].
* [cite_start]**Frontend:** Next.js Dashboard (Senior-friendly, high-contrast visuals, large typography)[cite: 151, 193].

---

## [cite_start]4. UI/UX & Dashboard Design [cite: 151]
* [cite_start]**Health Overview:** Real-time medicine levels (e.g., 85% remaining) and upcoming dose countdowns[cite: 153, 169, 170].
* [cite_start]**Treatment Adherence:** Visual tracking of "On-time", "Delayed", or "Missed" doses to reduce cognitive stress[cite: 153, 176].
* [cite_start]**Physical Sync:** Real-time monitoring of custom hardware trays via MQTT synchronization[cite: 155, 194].

---

## [cite_start]5. SDG Alignment [cite: 27, 28]
* [cite_start]**SDG 3 (Good Health):** Aims for >95% medication adherence, reducing deaths from non-communicable diseases[cite: 30, 31].
* [cite_start]**SDG 9 (Industry & Innovation):** Transforms traditional storage into localized, high-tech healthcare infrastructure[cite: 36, 37].
* [cite_start]**SDG 11 (Sustainable Cities):** Makes cities more "age-friendly" and eases the burden on urban healthcare systems[cite: 33, 34, 35].

---

## [cite_start]6. Implementation Plan (Gantt Chart) [cite: 210]
* [cite_start]**Phase 1:** Planning & Design (Ideation, CAD prototyping)[cite: 214, 216].
* [cite_start]**Phase 2:** Development Setup & Core Implementation (AI chatbot, Web fullstack, IoT testing)[cite: 215, 218, 219, 221].
* [cite_start]**Phase 3:** Testing & Deployment (Web and AI testing, final deployment)[cite: 220, 222].

---

## 7. Deep Tech & Data Requirements (Expansion)
* **Drug Database:** Plan to integrate with open databases (e.g., OpenFDA API) for drug interaction safety analysis.
* **Symptom Logic:** LLM (Llama 3.2) must prioritize identifying "Red Flags" based on World Health Organization (WHO) protocols.
* **AI Backend:** Separate Python service (FastAPI) to handle computationally heavy tasks like OCR and Real-time Symptom Classification.