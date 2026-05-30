# MechanzO Block IDE

A browser-native, zero-install visual programming environment built specifically for the **MechanzO ESP32-S3 DevModule**. 

This IDE allows students to drag and drop blocks, automatically generates valid Arduino C++ code, compiles it via a remote cloud server, and flashes the resulting binary directly to the robot using the browser's Native Web Serial API.

---

## 🏗️ Architecture Overview

The project is a pure Vanilla HTML/CSS/JS frontend application. It does not use Node.js, React, or build tools like Webpack.

1.  **Frontend (UI)**: Built with HTML/CSS. Features a "Retro-Futuristic" dark theme with an 8-bit RPG-style toolbox and a manual light/dark toggle.
2.  **Code Generation Engine**: Uses Google's **Blockly (v10.4.3)**. Custom block definitions translate visual logic into hardware-specific ESP32-S3 C++ code. Generation is triggered manually via the "Generate Code" button.
3.  **Compilation (Backend)**: The frontend sends the generated C++ to `mechanoz-server-production.up.railway.app`. The server compiles the code via `arduino-cli` using the `esp32s3` FQBN and returns a Base64-encoded `.bin` file.
4.  **Hardware Flashing**: Uses **Web Serial API** combined with a bundled local version of **`esptool-js`** to write the binary directly to the board's memory.

---

## 🔌 Hardware Specifications (ESP32-S3)

The IDE categorizes hardware into two types: hardcoded components permanently soldered to the MechanzO board, and user-configurable components connected via RJ11 ports.

### Hardcoded Pins (Internal)
*   **LED 1**: GPIO 38
*   **LED 2**: GPIO 39
*   **LED 3**: GPIO 40
*   **Buzzer**: GPIO 17
*   **Built-in Switch**: GPIO 41 (`INPUT_PULLUP`, Active LOW)
*   **I2C Pins**: SDA = 47, SCL = 48
*   **Analog Sensors**: Routed through an **ADS1115** ADC chip (I2C Address `0x48`).
*   **Display**: I2C OLED **SSD1306** (Address `0x3C`).
*   **Display (External)**: I2C LCD **16x2** (Address `0x27`).
*   **Servo Controller**: I2C **PCA9685** (Address `0x40`).

### User-Configurable Pins (RJ11 Ports)
The IDE now includes dynamic input fields for these components to allow flexible wiring:
*   **IR / Digital Sensors**: Any valid GPIO (e.g., 10, 35, 36, 37).
*   **Ultrasonic Sensor**: Requires specific `TRIG` and `ECHO` pins.
*   **DC Motor Control**: Requires `ENA`, `IN1`, and `IN2` pins (driven via L298N logic).
*   **Servos**: Controlled via the PCA9685 (Channels 0-15).

*Note: Because this uses the ESP32-S3's Native USB (seen as "USB JTAG/serial debug unit"), the flasher relies on precise DTR/RTS signal toggling to enter the ROM bootloader and exit into the application.*

---

## 🧩 Supported Block Capabilities

The IDE has been expanded to support a wider array of functionality:

- **Control & Logic**: Standard loops, conditionals, delays, and boolean math.
- **Outputs**: LEDs, Buzzer, I2C OLED Display, I2C 16x2 LCD Display, DC Motors (L298N), and Servos (PCA9685).
- **Sensors (8-Bit Category)**: Read raw Analog (via ADS1115), Digital Input, and precise Ultrasonic distance measurement.
- **Variables**: Full support for global variable declaration, setting, and getting (int, float, bool, String).

---

## 🛠️ The "Bridge Module" (ESPTool Implementation)

To use the official `esptool-js` library without triggering `Uncaught SyntaxError: Unexpected token 'export'`, this project uses a local ESM bundle (`esptool-bundle.js`) loaded dynamically:

```javascript
const { ESPLoader, Transport } = await import('./esptool-bundle.js');
```
This allows `script.js` to remain a standard classic script while still having access to modern serial transport constructors.

---

## 🚀 The Flashing Pipeline (`script.js`)

When the "Flash to Robot" button is clicked, the following sequence occurs:

1.  **Code Check**: Verifies the code panel isn't empty.
2.  **Web Serial Handshake**: Immediately calls `navigator.serial.requestPort()` (This MUST be the first async action to satisfy browser security).
3.  **Cloud Compile**: Sends the C++ code via `POST` to the production server.
4.  **Binary Decoding**: Converts the returned Base64 string into a `Uint8Array`.
5.  **ESPTool Flash**: Instantiates the loader at `115200` baud and writes the binary to address `0x10000`.
6.  **S3 Reset Handshake**: Toggles DTR/RTS lines with precise 100ms timing to force the ESP32-S3 to jump from the ROM bootloader to the user application.
7.  **Success Reporting**: UI updates to "Success" before closing the port to prevent false failure reports if the serial connection severs during reboot.

---

## ⚠️ Troubleshooting Guide

### 1. "CodeGenerator init was not called"
If you add new generators and see this, ensure `arduinoGenerator.init(workspace);` is being called before `arduinoGenerator.blockToCode()` inside the `updateCode` function.

### 2. "Unexpected token 'export'"
This means the browser cache is holding an old version of `bundle.js` or the `<script type="module">` bridge was removed from `index.html`. Do a Hard Refresh (`Ctrl + F5`) or test in Incognito.

### 3. "Failed to trigger workflow / 500 Error"
This is a **Backend Error**. The Render server failed to trigger the compilation workflow on GitHub Actions.
*   **Fix**: Check the GitHub Personal Access Token (PAT) on the Render server environment variables. Ensure it has `workflow` permissions.

### 4. "Binary artefact not found"
This is a **Backend Error**. The server triggered compilation, but the compiler failed to produce a `.bin` file.
*   **Fix**: Check the GitHub Actions logs. The generated C++ code might have a syntax error, or the backend `arduino-cli` environment is missing required libraries (e.g., `Adafruit_SSD1306`, `Adafruit_ADS1X15`).

### 5. Toolbar Disappears / Layout Breaks
Ensure the `OUTPUT_SHAPE_HEXAGONAL` constant is spelled correctly in the block definitions. A syntax crash here halts the entire Blockly injection. Also, verify `style.css` maintains `margin-top: 0 !important` on `.blocklyToolboxDiv` to prevent white space gaps.

---

## 💻 Local Development

Because this project relies heavily on CORS and Web Serial APIs, it is highly recommended to develop using a local server rather than double-clicking the `index.html` file.

1.  Install the Live Server extension in VS Code.
2.  Open the root `EmbedBlocks` folder.
3.  Click "Go Live".
