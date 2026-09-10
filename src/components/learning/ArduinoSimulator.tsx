'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Cable, Cpu, Power, Radio, ToggleLeft, Zap } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

type CableId = 'power' | 'ground' | 'buttonSignal' | 'ledSignal';
type PinId = '5v' | 'gnd' | 'd2' | 'd13' | 'a0' | 'pwm9';

const cables: Array<{
  id: CableId;
  label: string;
  color: string;
  expectedPin: PinId;
  detail: string;
}> = [
  { id: 'power', label: 'Power rail', color: 'bg-amber-400', expectedPin: '5v', detail: 'Supplies the virtual sensor rail and input module.' },
  { id: 'ground', label: 'Ground return', color: 'bg-slate-300', expectedPin: 'gnd', detail: 'Completes the circuit so signal detection works cleanly.' },
  { id: 'buttonSignal', label: 'Button signal', color: 'bg-brand-secondary', expectedPin: 'd2', detail: 'Routes the button press into the Uno input pin.' },
  { id: 'ledSignal', label: 'LED output', color: 'bg-fuchsia-400', expectedPin: 'd13', detail: 'Routes the output state to the LED signal channel.' },
];

const pins: Array<{
  id: PinId;
  label: string;
  group: 'power' | 'digital' | 'analog';
}> = [
  { id: '5v', label: '5V', group: 'power' },
  { id: 'gnd', label: 'GND', group: 'power' },
  { id: 'd2', label: 'D2', group: 'digital' },
  { id: 'd13', label: 'D13', group: 'digital' },
  { id: 'a0', label: 'A0', group: 'analog' },
  { id: 'pwm9', label: 'PWM9', group: 'digital' },
];

const initialConnections: Record<CableId, PinId | null> = {
  power: null,
  ground: null,
  buttonSignal: null,
  ledSignal: null,
};

export function ArduinoSimulator() {
  const [buttonPressed, setButtonPressed] = useState(false);
  const [manualLed, setManualLed] = useState(false);
  const [selectedCable, setSelectedCable] = useState<CableId | null>(null);
  const [connections, setConnections] = useState<Record<CableId, PinId | null>>(initialConnections);

  const wiringState = useMemo(() => {
    const powerReady = connections.power === '5v';
    const groundReady = connections.ground === 'gnd';
    const buttonReady = connections.buttonSignal === 'd2' && powerReady && groundReady;
    const ledReady = connections.ledSignal === 'd13' && groundReady;
    const connectedCount = Object.values(connections).filter(Boolean).length;
    const mismatches = cables.filter((cable) => connections[cable.id] && connections[cable.id] !== cable.expectedPin);

    return {
      powerReady,
      groundReady,
      buttonReady,
      ledReady,
      connectedCount,
      mismatches,
      fullyWired: powerReady && groundReady && buttonReady && ledReady,
    };
  }, [connections]);

  const ledOn = wiringState.ledReady && (buttonPressed && wiringState.buttonReady || manualLed);

  const handlePinSelect = (pinId: PinId) => {
    if (!selectedCable) return;
    setConnections((current) => ({
      ...current,
      [selectedCable]: pinId,
    }));
    setSelectedCable(null);
  };

  const disconnectCable = (cableId: CableId) => {
    setConnections((current) => ({
      ...current,
      [cableId]: null,
    }));
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#080b18] p-5 shadow-glass">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-xl font-bold text-white">Arduino Uno Vision Lab</p>
          <p className="text-sm text-white/50">
            A futuristic Uno board experience with cable recognition, input/output detection, and live signal status.
          </p>
        </div>
        <Badge variant={wiringState.fullyWired ? 'success' : wiringState.mismatches.length > 0 ? 'danger' : 'accent'}>
          {wiringState.fullyWired ? 'Circuit detected' : wiringState.mismatches.length > 0 ? 'Cable mismatch' : 'Awaiting wiring'}
        </Badge>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Cable className="h-4 w-4 text-brand-accent" />
              Cable kit
            </div>
            <div className="space-y-3">
              {cables.map((cable) => {
                const connectedPin = connections[cable.id];
                const selected = selectedCable === cable.id;
                const correct = connectedPin === cable.expectedPin;
                return (
                  <button
                    key={cable.id}
                    type="button"
                    onClick={() => setSelectedCable(cable.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-brand-secondary/50 bg-brand-secondary/12'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${cable.color}`} />
                        <p className="font-medium text-white">{cable.label}</p>
                      </div>
                      <span className="text-xs text-white/40">
                        {connectedPin ? `${correct ? 'Detected' : 'Miswired'} on ${connectedPin.toUpperCase()}` : 'Not connected'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/50">{cable.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Radio className="h-4 w-4 text-brand-accent" />
              Wiring telemetry
            </div>
            <div className="space-y-2 text-sm text-white/60">
              <div className="rounded-xl bg-black/20 p-3">Power rail: {wiringState.powerReady ? 'Detected on 5V' : 'Waiting for cable'}</div>
              <div className="rounded-xl bg-black/20 p-3">Ground return: {wiringState.groundReady ? 'Detected on GND' : 'Waiting for cable'}</div>
              <div className="rounded-xl bg-black/20 p-3">Button input: {wiringState.buttonReady ? 'Signal path active on D2' : 'Signal path incomplete'}</div>
              <div className="rounded-xl bg-black/20 p-3">LED output: {wiringState.ledReady ? 'Output path active on D13' : 'Output path incomplete'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[30px] border border-brand-secondary/20 bg-gradient-to-br from-[#0f1440] via-[#12006B] to-[#1e275f] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Cpu className="h-4 w-4 text-brand-secondary" />
                Futuristic Arduino Uno surface
              </div>
              <Badge variant="primary">{wiringState.connectedCount}/4 cables detected</Badge>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[26px] border border-white/10 bg-black/25 p-5">
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pins.map((pin) => {
                    const connectedCable = cables.find((cable) => connections[cable.id] === pin.id);
                    const active = selectedCable !== null;
                    const correct = connectedCable ? connectedCable.expectedPin === pin.id : false;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => handlePinSelect(pin.id)}
                        className={`rounded-2xl border px-3 py-4 text-left transition-all ${
                          connectedCable
                            ? correct
                              ? 'border-emerald-400/40 bg-emerald-400/10'
                              : 'border-rose-400/40 bg-rose-400/10'
                            : active
                              ? 'border-brand-secondary/40 bg-brand-secondary/10'
                              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-white/35">{pin.group}</p>
                        <p className="mt-2 font-heading text-lg font-semibold text-white">{pin.label}</p>
                        <p className="mt-2 text-[11px] text-white/45">
                          {connectedCable ? `${connectedCable.label} detected` : active ? 'Tap to connect selected cable' : 'Ready'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <Zap className="h-4 w-4 text-brand-accent" />
                    Connection matrix
                  </div>
                  <div className="grid gap-2 text-xs text-white/60 sm:grid-cols-2">
                    {cables.map((cable) => {
                      const pin = connections[cable.id];
                      const correct = pin === cable.expectedPin;
                      return (
                        <div key={cable.id} className="rounded-xl bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span>{cable.label}</span>
                            <span className={correct ? 'text-emerald-300' : pin ? 'text-rose-300' : 'text-white/35'}>
                              {pin ? `${correct ? 'OK' : 'Wrong'}: ${pin.toUpperCase()}` : 'Not connected'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <ToggleLeft className="h-4 w-4 text-brand-accent" />
                    Input + output controls
                  </div>
                  <Button
                    className="mb-3 w-full justify-center"
                    variant={buttonPressed ? 'primary' : 'secondary'}
                    disabled={!wiringState.buttonReady}
                    onMouseDown={() => setButtonPressed(true)}
                    onMouseUp={() => setButtonPressed(false)}
                    onMouseLeave={() => setButtonPressed(false)}
                    onTouchStart={() => setButtonPressed(true)}
                    onTouchEnd={() => setButtonPressed(false)}
                    icon={<ToggleLeft className="h-4 w-4" />}
                  >
                    {wiringState.buttonReady ? 'Hold Button Input' : 'Wire button signal to D2 first'}
                  </Button>
                  <Button
                    className="w-full justify-center"
                    variant={manualLed ? 'danger' : 'secondary'}
                    disabled={!wiringState.ledReady}
                    onClick={() => setManualLed((value) => !value)}
                    icon={<Power className="h-4 w-4" />}
                  >
                    {wiringState.ledReady ? (manualLed ? 'Turn LED Off' : 'Turn LED On') : 'Wire LED output to D13 first'}
                  </Button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <Radio className="h-4 w-4 text-brand-accent" />
                    LED node
                  </div>
                  <div className="flex min-h-[140px] items-center justify-center">
                    <motion.div
                      animate={{
                        boxShadow: ledOn ? '0 0 42px rgba(51,214,255,0.95), 0 0 82px rgba(138,63,252,0.4)' : '0 0 0 rgba(0,0,0,0)',
                        backgroundColor: ledOn ? '#33D6FF' : '#111827',
                        scale: ledOn ? 1.1 : 1,
                      }}
                      className="h-24 w-24 rounded-full border-[10px] border-slate-700"
                    />
                  </div>
                  <p className="text-center text-sm text-white/55">LED {ledOn ? 'ACTIVE' : 'OFFLINE'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs text-emerald-100">
            selectedCable = {selectedCable ?? 'none'}
            <br />
            digitalRead(button) = {wiringState.buttonReady && buttonPressed ? 'HIGH' : 'LOW'}
            <br />
            digitalWrite(led, {ledOn ? 'HIGH' : 'LOW'})
            <br />
            cableDetection = {wiringState.connectedCount}/4
          </div>

          <div className="flex flex-wrap gap-3">
            {cables.map((cable) => (
              <Button
                key={cable.id}
                type="button"
                variant="ghost"
                onClick={() => disconnectCable(cable.id)}
                className="justify-center"
              >
                Clear {cable.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
