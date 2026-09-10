// MQTT Service for IoT Device Communication
//
// IMPORTANT: We dynamically import the `mqtt` package only when the service
// is actually used. The mqtt browser bundle is ~150 kB gzipped — having every
// page pay that cost just because we import this module would tank the initial
// load Lighthouse score.
//
// We also no longer construct a singleton at module-load time, which used to
// open a TCP socket to localhost:9001 on every page navigation.

import type { MqttClient, IClientOptions } from 'mqtt';

interface DeviceMessage {
  deviceId: string;
  topic: string;
  payload: unknown;
  timestamp: Date;
}

interface SensorData {
  temperature?: number;
  humidity?: number;
  distance?: number;
  battery?: number;
  motion?: boolean;
  light?: number;
  [key: string]: unknown;
}

type MessageHandler = (deviceId: string, data: SensorData) => void;
type StatusHandler = (deviceId: string, status: 'online' | 'offline') => void;

class MQTTService {
  private client: MqttClient | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private statusHandlers: StatusHandler[] = [];
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor() {
    // Lazy: do nothing at module load. Call `connect()` from the page that needs MQTT.
  }

  /**
   * Connects to the MQTT broker. Idempotent — calling repeatedly is a no-op once
   * connected. The `mqtt` package is dynamically imported here so it's only in
   * the bundle for pages that actually call connect().
   */
  async connect(brokerUrl?: string) {
    if (this.client) return;

    const url =
      brokerUrl ||
      (typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_MQTT_BROKER_URL
        : process.env.MQTT_BROKER_URL) ||
      'ws://localhost:9001';

    const mqttModule = await import('mqtt');
    const mqtt = (mqttModule as any).default || mqttModule;

    const options: IClientOptions = {
      clientId: `robotix_client_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 5000,
      username: process.env.MQTT_USERNAME || undefined,
      password: process.env.MQTT_PASSWORD || undefined,
    };

    try {
      this.client = mqtt.connect(url, options);
      this.setupEventHandlers();
    } catch (error) {
      console.error('MQTT connection error:', error);
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('connect', () => {
      console.log('MQTT connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      
      // Subscribe to general status topic
      this.client?.subscribe('robotix/devices/+/status');
      this.client?.subscribe('robotix/devices/+/sensors');
    });

    this.client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        this.handleMessage(topic, payload);
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
    });

    this.client.on('close', () => {
      this.connected = false;
      console.log('MQTT connection closed');
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      console.log(`MQTT reconnecting... (attempt ${this.reconnectAttempts})`);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.client?.end();
        console.error('Max reconnect attempts reached');
      }
    });
  }

  private handleMessage(topic: string, payload: unknown) {
    // Parse topic: robotix/devices/{deviceId}/{type}
    const parts = topic.split('/');
    if (parts.length < 4 || parts[0] !== 'robotix') return;

    const deviceId = parts[2];
    const messageType = parts[3];

    if (messageType === 'status') {
      const status = (payload as { status: string }).status as 'online' | 'offline';
      this.statusHandlers.forEach(handler => handler(deviceId, status));
    } else if (messageType === 'sensors') {
      const handlers = this.messageHandlers.get(deviceId) || [];
      handlers.forEach(handler => handler(deviceId, payload as SensorData));
      
      // Also notify global handlers
      const globalHandlers = this.messageHandlers.get('*') || [];
      globalHandlers.forEach(handler => handler(deviceId, payload as SensorData));
    }
  }

  // Subscribe to a specific device's sensor data
  subscribeToDevice(deviceId: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(deviceId)) {
      this.messageHandlers.set(deviceId, []);
    }
    this.messageHandlers.get(deviceId)!.push(handler);

    // Subscribe to device-specific topic
    if (this.client && this.connected) {
      this.client.subscribe(`robotix/devices/${deviceId}/sensors`);
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(deviceId);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  // Subscribe to all device status changes
  onStatusChange(handler: StatusHandler) {
    this.statusHandlers.push(handler);
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) this.statusHandlers.splice(index, 1);
    };
  }

  // Send command to device
  sendCommand(deviceId: string, command: string, payload?: unknown) {
    if (!this.client || !this.connected) {
      throw new Error('MQTT not connected');
    }

    const topic = `robotix/devices/${deviceId}/commands`;
    const message = JSON.stringify({
      command,
      payload,
      timestamp: new Date().toISOString(),
    });

    this.client.publish(topic, message, { qos: 1 });
  }

  // Send movement command
  moveRobot(deviceId: string, direction: 'forward' | 'backward' | 'left' | 'right' | 'stop', speed = 100) {
    this.sendCommand(deviceId, 'move', { direction, speed });
  }

  // Control servo
  setServo(deviceId: string, servoId: number, angle: number) {
    this.sendCommand(deviceId, 'servo', { servoId, angle });
  }

  // Control LED
  setLED(deviceId: string, ledId: number, state: boolean | number) {
    this.sendCommand(deviceId, 'led', { ledId, state });
  }

  // Request sensor reading
  requestSensorData(deviceId: string) {
    this.sendCommand(deviceId, 'read_sensors');
  }

  // Check connection status
  isConnected() {
    return this.connected;
  }

  // Manually reconnect
  async reconnect() {
    if (this.client) {
      this.client.reconnect();
    } else {
      await this.connect();
    }
  }

  // Disconnect
  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.connected = false;
    }
  }
}

// Export singleton instance
export const mqttService = new MQTTService();

// Export for server-side use
export function createMQTTService() {
  return new MQTTService();
}

export type { SensorData, DeviceMessage, MessageHandler, StatusHandler };
