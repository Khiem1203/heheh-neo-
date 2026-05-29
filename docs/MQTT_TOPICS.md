# MQTT Messaging Protocol - Ecyce MediLink
> **Disclaimer:** This document provides a conceptual framework and initial context for project development. It is not a fixed set of rules and is subject to dynamic changes or iterations throughout the build process as new requirements arise.

## 1. Broker Configuration
* **Type:** Cloud MQTT Broker (HiveMQ or Adafruit IO) for mobility.
* **QoS Level:** 1 (At least once delivery) to ensure medical safety.

## 2. Topic Hierarchy
### Laptop -> ESP32 (Commands)
* `ecyce/medilink/dispense`: Triggers the dispensing sequence.
    * **Payload (JSON):** `{"tray": 1, "quantity": 1, "timestamp": "2026-05-11T16:30:00"}`
* `ecyce/medilink/alert`: Triggers LED/Buzzer for reminders.
    * **Payload:** `{"state": "ON", "pattern": "blink"}`

### [cite_start]ESP32 -> Laptop (Status Feedback) [cite: 52, 95]
* `ecyce/medilink/status`: Reports mechanical success or failure.
    * [cite_start]**Payload (JSON):** `{"device_id": "ESP32_01", "status": "SUCCESS", "tray": 1}` [cite: 72]
* `ecyce/medilink/inventory`: Updates remaining pill counts.
    * [cite_start]**Payload:** `{"tray": 1, "remaining": 18}` [cite: 188]
* `ecyce/medilink/error`: Reports jams or connectivity issues.