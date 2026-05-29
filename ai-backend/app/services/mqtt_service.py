import paho.mqtt.client as mqtt
import json

MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "ecyce/medilink/device1"

def send_motor_command(motor_index: int, pill_count: int):
    """Sends a command like 'MOTOR 1: 2;' to the ESP32"""
    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id="fastapi-backend-pub")
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        payload = f"MOTOR {motor_index}: {pill_count};"
        client.publish(MQTT_TOPIC, payload)
        print(f"MQTT SUCCESS: Published {payload} to {MQTT_TOPIC}")
        client.disconnect()
        return True
    except Exception as e:
        print(f"MQTT ERROR: {str(e)}")
        return False
