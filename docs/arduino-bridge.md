# Robotix Arduino Bridge

Run the local uploader bridge:

```bash
npm run arduino:bridge
```

Requirements:

1. Install `arduino-cli` and make sure it is on your `PATH`.
2. Install the board cores you want to use, for example:

```bash
arduino-cli core install arduino:avr
arduino-cli core install esp32:esp32
```

3. Connect a supported board and confirm it appears in:

```bash
arduino-cli board list
```

What the bridge enables:

- Health checks from the browser
- Real board detection
- Real `verify` through `arduino-cli compile`
- Real `upload` through `arduino-cli upload`

The Robotix IDE will auto-detect the bridge at:

```text
http://127.0.0.1:3210
```

Optional environment variables:

- `ROBOTIX_ARDUINO_BRIDGE_HOST`
- `ROBOTIX_ARDUINO_BRIDGE_PORT`
