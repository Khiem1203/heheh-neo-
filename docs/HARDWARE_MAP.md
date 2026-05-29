# Hardware Mapping - Ecyce MediLink
> **Disclaimer:** This document provides a conceptual framework and initial context for project development. It is not a fixed set of rules and is subject to dynamic changes or iterations throughout the build process as new requirements arise.

## 1. Central Hub (Edge AI & Backend)
* **Device:** Lenovo Thinkpad P1 (Workstation).
* [cite_start]**Role:** Hosts Web App, MQTT Broker, and Edge AI Engines (OCR, Face ID, LLM)[cite: 48, 49].
* [cite_start]**Peripherals:** Rapoo 1080p Webcam (USB) for scanning and identity verification[cite: 89, 131].

## 1. Central Hub (Edge AI & Backend)
* **Device:** Lenovo Thinkpad P1 (Workstation)
* **Role:** Hosts the Next.js Web App, MQTT Broker (Local/Cloud), and Edge AI Engines (Tesseract, MediaPipe, Llama 3.2).
* [cite_start]**Peripheral Connection:** * **Webcam:** Rapoo 1080p via USB (Used for OCR & Face Recognition)[cite: 131, 138].
    * **Network:** WiFi/Mobile Hotspot for MQTT communication with Actuator Node.

## 2. Actuator Node (Dispensing Control)
* [cite_start]**Microcontroller:** ESP32[cite: 50, 107].
* **Connectivity:** WiFi (MQTT Protocol).
* **Pin Mapping:**
    * [cite_start]**Servo Motors (x3 Trays):** * Servo 1 (Tray 1): GPIO 18 (PWM)[cite: 105, 108].
        * [cite_start]Servo 2 (Tray 2): GPIO 19 (PWM)[cite: 105, 108].
        * [cite_start]Servo 3 (Tray 3): GPIO 21 (PWM)[cite: 105, 108].
    * **Feedback System:**
        * [cite_start]LED Indicator: GPIO 2 (Output)[cite: 120].
        * [cite_start]Buzzer (Alarm): GPIO 4 (Output)[cite: 120].
    * [cite_start]**Manual Trigger:** * Push Button: GPIO 5 (Input_Pullup)[cite: 119].

## 3. Mechanical Concept
* [cite_start]**Storage:** 4-quadrant frame for vertical stacking[cite: 121].
* [cite_start]**Mechanism:** Rotary disc with customized slots for pill singulation[cite: 123, 124].
* [cite_start]**Dispensing:** Controlled rotation to align slot with delivery funnel[cite: 126].