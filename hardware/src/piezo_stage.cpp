#include <Arduino.h>

#include "config_pins.h"
#include "piezo_stage.h"

void piezoStageBegin() {
  pinMode(PIEZO_PIN, INPUT_PULLUP);
}

bool piezoStageTriggered() {
  int highCount = 0;
  for (int i = 0; i < 3; i++) {
    if (analogRead(PIEZO_PIN) > PIEZO_THRESHOLD) {
      highCount++;
    }
    delay(2); // Small interval between samples
  }
  return highCount >= 2; // Trigger if 2 out of 3 samples are above threshold
}

void piezoUnitTest() {
  Serial.println("Starting Piezo Stage Unit Test...");
  piezoStageBegin();
  Serial.println("Piezo Stage Initialized. Please trigger the piezo sensor.");
  
  while (true) {
    if (piezoStageTriggered()) {
      Serial.println("Piezo sensor triggered!");
      delay(1000); // Debounce delay
    }
  }
}