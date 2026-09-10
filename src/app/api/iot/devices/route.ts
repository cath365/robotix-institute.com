// Deprecated path. Both /api/iot/devices and /api/iot-devices behaved identically.
// We keep this re-export so existing client code continues to work, but new code
// should hit /api/iot-devices directly.
export { GET, POST } from '@/app/api/iot-devices/route';
