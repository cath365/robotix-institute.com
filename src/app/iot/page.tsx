'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge, Button, Input, EmptyState } from '@/components/ui';
import { useAuth, useApi } from '@/hooks/useApi';
import {
  Wifi, WifiOff, Camera, Thermometer, Droplets, Move,
  RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Power, Gauge, Activity, Zap, Signal, Plus, Cpu, X,
} from 'lucide-react';

interface ApiDevice {
  id: string;
  name: string;
  deviceType: string;
  mqttTopic: string;
  status: string;
  lastSeen?: string;
  sensorData?: Record<string, number | string> | null;
}

const SIM_DEVICE: ApiDevice = {
  id: 'sim',
  name: 'ZamBot Simulator',
  deviceType: 'esp32',
  mqttTopic: 'sim/zambot',
  status: 'online',
  sensorData: { temperature: 24.5, humidity: 65, distance: 42, battery: 78 },
};

export default function IoTPage() {
  const { isAuthenticated, token } = useAuth();
  const { get } = useApi();
  const [devices, setDevices] = useState<ApiDevice[]>([SIM_DEVICE]);
  const [selected, setSelected] = useState<ApiDevice>(SIM_DEVICE);
  const [sensorData, setSensorData] = useState<Record<string, number>>(
    SIM_DEVICE.sensorData as Record<string, number>
  );
  const [commandLog, setCommandLog] = useState<string[]>([
    '> System initialized',
    '> Subscribed to sensor topics',
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', deviceType: 'esp32', mqttTopic: '' });
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSim = selected.id === 'sim';

  // Load real devices when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    get<{ devices?: ApiDevice[] } | ApiDevice[]>('/iot-devices?limit=20')
      .then((res) => {
        const list: ApiDevice[] = Array.isArray(res.data)
          ? (res.data as ApiDevice[])
          : ((res.data as any)?.devices ?? (res.data as any)?.items ?? []);
        if (list.length > 0) {
          setDevices([SIM_DEVICE, ...list]);
        }
      })
      .catch(() => { /* ignore */ });
  }, [isAuthenticated, get]);

  // When a real device is selected, sensor data comes from the API; for the
  // simulator we generate plausible numbers locally.
  useEffect(() => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    if (isSim) {
      simIntervalRef.current = setInterval(() => {
        setSensorData((prev) => ({
          ...prev,
          temperature: +((prev.temperature ?? 24) + (Math.random() - 0.5) * 0.4).toFixed(1),
          humidity: Math.max(0, Math.min(100, Math.round((prev.humidity ?? 60) + (Math.random() - 0.5) * 2))),
          distance: Math.max(2, Math.round((prev.distance ?? 40) + (Math.random() - 0.5) * 6)),
          battery: Math.max(0, Math.round((prev.battery ?? 78) - 0.05)),
        }));
      }, 1500);
    } else {
      const data = (selected.sensorData || {}) as Record<string, number>;
      setSensorData(data);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [selected, isSim]);

  const sendCommand = useCallback(async (cmd: string) => {
    const ts = new Date().toLocaleTimeString();
    setCommandLog((prev) => [...prev.slice(-50), `[${ts}] > ${cmd}`]);

    if (isSim) {
      setTimeout(() => {
        setCommandLog((prev) => [...prev, `[${ts}] < ACK: ${cmd} executed (simulated)`]);
      }, 250);
      return;
    }

    try {
      const res = await fetch(`/api/iot-devices/${selected.id}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommandLog((prev) => [...prev, `[${ts}] < ACK: ${cmd}`]);
      } else {
        setCommandLog((prev) => [...prev, `[${ts}] ✖ ${data?.error || res.statusText}`]);
      }
    } catch (e: any) {
      setCommandLog((prev) => [...prev, `[${ts}] ✖ ${e?.message || 'Send failed'}`]);
    }
  }, [isSim, selected.id, token]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to register a device');
      return;
    }
    if (!newDevice.name || !newDevice.mqttTopic) {
      toast.error('Please enter a name and MQTT topic');
      return;
    }
    try {
      const res = await fetch('/api/iot-devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newDevice),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        toast.success('Device registered');
        setDevices((d) => [...d, data.data]);
        setSelected(data.data);
        setShowAdd(false);
        setNewDevice({ name: '', deviceType: 'esp32', mqttTopic: '' });
      } else {
        throw new Error(data?.error || 'Register failed');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Could not register');
    }
  };

  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-8 overflow-hidden">
        <div className="circuit-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="accent" className="mb-4">
              <Wifi className="w-3 h-3 mr-1" /> IoT Robot Control
            </Badge>
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-2">
              IoT Control Center
            </h1>
            <p className="text-white/50">
              {isSim
                ? 'You are connected to the local simulator. Register a real ESP32 to control your own device.'
                : `Connected to ${selected.name} via MQTT (${selected.mqttTopic})`}
            </p>
          </motion.div>
        </div>
      </section>

      <Section className="py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Device List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-heading font-semibold text-white/60">Your Devices</h3>
              <button
                onClick={() => setShowAdd(!showAdd)}
                aria-label="Register a new device"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
              >
                {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showAdd && (
              <GlassCard className="p-4 space-y-3">
                <Input label="Name" placeholder="My ESP32" value={newDevice.name} onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-white/70">Type</label>
                  <select
                    value={newDevice.deviceType}
                    onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                    className="input-field"
                  >
                    <option value="esp32" className="bg-brand-dark">ESP32</option>
                    <option value="arduino" className="bg-brand-dark">Arduino</option>
                    <option value="raspberry_pi" className="bg-brand-dark">Raspberry Pi</option>
                  </select>
                </div>
                <Input label="MQTT Topic" placeholder="robotix/me/zambot" value={newDevice.mqttTopic} onChange={(e) => setNewDevice({ ...newDevice, mqttTopic: e.target.value })} />
                <Button onClick={handleRegister} className="w-full" size="sm">Register</Button>
              </GlassCard>
            )}

            {devices.map((device) => (
              <GlassCard
                key={device.id}
                hover
                className={`p-4 cursor-pointer ${selected.id === device.id ? 'border-brand-accent/40' : ''}`}
                onClick={() => setSelected(device)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{device.name}</div>
                    <div className="text-xs text-white/40">
                      {device.deviceType.toUpperCase()}
                      {device.lastSeen ? ` · ${new Date(device.lastSeen).toLocaleTimeString()}` : ''}
                    </div>
                  </div>
                  {device.status === 'online' ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
                </div>
              </GlassCard>
            ))}

            {!isAuthenticated && (
              <p className="text-xs text-white/40 mt-2">
                <Link href="/login" className="text-brand-accent hover:underline">Sign in</Link> to register your own ESP32.
              </p>
            )}

            {/* Architecture */}
            <GlassCard className="p-4 mt-4">
              <h4 className="text-xs font-heading text-white/40 mb-3">Architecture</h4>
              <div className="space-y-2 text-xs text-center">
                {['🌐 Browser', '↓', '⚙️ Robotix API', '↓', '📡 MQTT Broker', '↓', '🤖 ESP32'].map((item, i) => (
                  <div key={i} className={item === '↓' ? 'text-brand-accent' : 'py-1.5 px-2 rounded-lg bg-white/5 text-white/70'}>
                    {item}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3 space-y-6">
            <GlassCard className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${selected.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <h2 className="font-heading text-lg font-bold text-white">{selected.name}</h2>
                  <Badge variant={selected.status === 'online' ? 'success' : 'danger'}>{selected.status}</Badge>
                  {isSim && <Badge variant="primary">simulator</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendCommand('REFRESH')}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant={selected.status === 'online' ? 'danger' : 'primary'}
                    size="sm"
                    icon={<Power className="w-4 h-4" />}
                    onClick={() => sendCommand(selected.status === 'online' ? 'DISCONNECT' : 'CONNECT')}
                  >
                    {selected.status === 'online' ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Sensor Data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(sensorData).length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={<Cpu className="w-8 h-8" />}
                    title="No sensor data yet"
                    description="Once your device publishes to MQTT, sensor values will appear here in real time."
                  />
                </div>
              ) : Object.entries(sensorData).map(([key, value]) => {
                const icons: Record<string, React.ReactNode> = {
                  temperature: <Thermometer className="w-5 h-5" />,
                  humidity: <Droplets className="w-5 h-5" />,
                  distance: <Signal className="w-5 h-5" />,
                  battery: <Zap className="w-5 h-5" />,
                  soilMoisture: <Droplets className="w-5 h-5" />,
                  altitude: <Move className="w-5 h-5" />,
                };
                const units: Record<string, string> = {
                  temperature: '°C', humidity: '%', distance: 'cm',
                  battery: '%', soilMoisture: '%', altitude: 'm',
                };
                return (
                  <GlassCard key={key} className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-brand-accent">
                      {icons[key] || <Gauge className="w-5 h-5" />}
                      <span className="text-xs text-white/40 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <div className="text-2xl font-heading font-bold text-white">
                      {typeof value === 'number' ? value : String(value)}
                      <span className="text-sm text-white/40 ml-1">{units[key] || ''}</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                  <Move className="w-4 h-4 text-brand-accent" /> Remote Control
                </h3>
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => sendCommand('MOVE_FORWARD')} icon={<ArrowUp className="w-5 h-5" />}>Forward</Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => sendCommand('TURN_LEFT')} icon={<ArrowLeft className="w-5 h-5" />}>Left</Button>
                    <Button variant="primary" size="sm" onClick={() => sendCommand('STOP')}>STOP</Button>
                    <Button variant="ghost" size="sm" onClick={() => sendCommand('TURN_RIGHT')} icon={<ArrowRight className="w-5 h-5" />}>Right</Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => sendCommand('MOVE_BACKWARD')} icon={<ArrowDown className="w-5 h-5" />}>Backward</Button>
                  <div className="flex gap-2 mt-3 flex-wrap justify-center">
                    <Button variant="secondary" size="sm" onClick={() => sendCommand('SCAN_SENSOR')}>Scan</Button>
                    <Button variant="secondary" size="sm" onClick={() => sendCommand('READ_TEMP')}>Temp</Button>
                    <Button variant="secondary" size="sm" onClick={() => sendCommand('TOGGLE_LED')}>LED</Button>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 flex flex-col">
                <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" /> Command Log
                </h3>
                <div className="flex-1 bg-black/30 rounded-xl p-3 overflow-auto max-h-64 font-mono text-xs">
                  {commandLog.map((log, i) => (
                    <div key={i} className={`py-0.5 ${log.includes('<') ? 'text-green-400' : log.includes('✖') ? 'text-red-400' : 'text-white/60'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-accent" /> Camera Feed
              </h3>
              <div className="aspect-video rounded-xl bg-black/50 flex items-center justify-center border border-white/5">
                <div className="text-center text-white/20">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Camera stream will appear here when an ESP32-CAM is connected.</p>
                  <p className="text-xs mt-1">MJPEG via the device&apos;s HTTP endpoint.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
