import { 
    auth, db, signUp, login, loginWithGoogle, logout, 
    onAuthStateChanged, doc, setDoc, getDoc 
} from './register.js';

/**
 * MechanzO Block IDE - script.js
 * Comprehensive Blockly implementation for ESP32-S3 MechanzO board.
 * Hardened for local and deployment usage.
 */

// --- Global Dependency Tracking ---
const requiredImports = new Set();
const setupStatements = new Set();
const globalDeclarations = new Set();

function clearDependencies() {
    requiredImports.clear();
    setupStatements.clear();
    globalDeclarations.clear();
}

// Ensure the page and Blockly are ready before execution
window.addEventListener('DOMContentLoaded', () => {

    // --- Block Definitions ---

    Blockly.Blocks['mechanzo_start'] = {
        init: function() {
            this.appendDummyInput().appendField("Start Program");
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip("Entry point for the program.");
            this.setStyle('hat_blocks');
        }
    };

    Blockly.Blocks['mechanzo_repeat'] = {
        init: function() {
            this.appendDummyInput().appendField("Repeat").appendField(new Blockly.FieldNumber(10, 0), "TIMES").appendField("times");
            this.appendStatementInput("DO").setCheck(null);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
        }
    };

    Blockly.Blocks['mechanzo_delay'] = {
        init: function() {
            this.appendDummyInput().appendField("Delay").appendField(new Blockly.FieldNumber(1000, 0), "MS").appendField("ms");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
        }
    };

    Blockly.Blocks['mechanzo_delay_s'] = {
        init: function() {
            this.appendDummyInput().appendField("Delay").appendField(new Blockly.FieldNumber(1, 0), "SEC").appendField("seconds");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
        }
    };

    Blockly.Blocks['mechanzo_if'] = {
        init: function() {
            this.appendValueInput("CONDITION").setCheck("Boolean").appendField("If");
            this.appendStatementInput("DO").setCheck(null).appendField("then");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
        }
    };

    Blockly.Blocks['mechanzo_if_else'] = {
        init: function() {
            this.appendValueInput("CONDITION").setCheck("Boolean").appendField("If");
            this.appendStatementInput("DO").setCheck(null).appendField("then");
            this.appendStatementInput("ELSE").setCheck(null).appendField("else");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
        }
    };

    Blockly.Blocks['mechanzo_led'] = {
        init: function() {
            this.appendDummyInput().appendField("LED").appendField(new Blockly.FieldDropdown([["LED 1", "38"], ["LED 2", "39"], ["LED 3", "40"]]), "PIN").appendField("State").appendField(new Blockly.FieldDropdown([["ON", "HIGH"], ["OFF", "LOW"]]), "STATE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(30);
        }
    };

    Blockly.Blocks['mechanzo_buzzer'] = {
        init: function() {
            this.appendDummyInput().appendField("Buzzer").appendField(new Blockly.FieldDropdown([["ON", "HIGH"], ["OFF", "LOW"]]), "STATE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(30);
        }
    };

    Blockly.Blocks['mechanzo_oled_print'] = {
        init: function() {
            this.appendValueInput("VALUE").setCheck(null).appendField("OLED Print");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(30);
        }
    };

    Blockly.Blocks['mechanzo_switch_pressed'] = {
        init: function() {
            this.appendDummyInput().appendField("Switch Pressed?");
            this.setOutput(true, "Boolean");
            this.setColour(120);
            this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
        }
    };

    Blockly.Blocks['mechanzo_ir_sensor'] = {
        init: function() {
            this.appendDummyInput().appendField("IR Sensor").appendField(new Blockly.FieldDropdown([["Port 1", "10"], ["Port 2", "35"]]), "PORT").appendField("detects object?");
            this.setOutput(true, "Boolean");
            this.setColour(120);
            this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
        }
    };

    Blockly.Blocks['mechanzo_read_analog'] = {
        init: function() {
            this.appendDummyInput().appendField("Read Analog").appendField(new Blockly.FieldDropdown([["Port 1", "0"], ["Port 2", "1"]]), "CHANNEL");
            this.setOutput(true, "Number");
            this.setColour(260);
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
        }
    };

    Blockly.Blocks['mechanzo_analog_sensor'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Read Analog Channel")
                .appendField(new Blockly.FieldNumber(0, 0, 3), "CHANNEL");
            this.setOutput(true, "Number");
            this.setColour(180);
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
            this.setTooltip("Read raw value from ADS1115 analog channel (0-3).");
        }
    };

    Blockly.Blocks['mechanzo_digital_sensor'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Read Digital Pin")
                .appendField(new Blockly.FieldNumber(10, 0, 45), "PIN");
            this.setOutput(true, "Number");
            this.setColour(180);
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
            this.setTooltip("Read HIGH(1) or LOW(0) from a digital sensor pin.");
        }
    };

    Blockly.Blocks['mechanzo_ultrasonic'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Ultrasonic Distance  TRIG")
                .appendField(new Blockly.FieldNumber(15, 0, 45), "TRIG")
                .appendField("ECHO")
                .appendField(new Blockly.FieldNumber(16, 0, 45), "ECHO")
                .appendField("cm");
            this.setOutput(true, "Number");
            this.setColour(180);
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
            this.setTooltip("Returns distance in cm using ultrasonic sensor.");
        }
    };

    Blockly.Blocks['mechanzo_var_declare'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Declare")
                .appendField(new Blockly.FieldDropdown([
                    ["int", "int"],
                    ["float", "float"],
                    ["bool", "bool"],
                    ["String", "String"]
                ]), "TYPE")
                .appendField(new Blockly.FieldTextInput("myVar"), "NAME")
                .appendField("=")
                .appendField(new Blockly.FieldTextInput("0"), "VALUE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(330);
            this.setTooltip("Declare a global variable with an initial value.");
        }
    };

    Blockly.Blocks['mechanzo_var_set'] = {
        init: function() {
            this.appendValueInput("VALUE")
                .setCheck(null)
                .appendField("Set")
                .appendField(new Blockly.FieldTextInput("myVar"), "NAME")
                .appendField("=");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(330);
            this.setTooltip("Set the value of a declared variable.");
        }
    };

    Blockly.Blocks['mechanzo_var_get'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Get")
                .appendField(new Blockly.FieldTextInput("myVar"), "NAME");
            this.setOutput(true, null);
            this.setColour(330);
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
            this.setTooltip("Get the current value of a variable.");
        }
    };

    Blockly.Blocks['mechanzo_lcd_print'] = {
        init: function() {
            this.appendValueInput("VALUE")
                .setCheck(null)
                .appendField("LCD Print");
            this.appendDummyInput()
                .appendField("Row")
                .appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "ROW");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(30);
            this.setTooltip("Print a value to the I2C LCD display (16x2). Row 0 = top, Row 1 = bottom.");
        }
    };

    Blockly.Blocks['mechanzo_motor'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Motor  ENA")
                .appendField(new Blockly.FieldNumber(18, 0, 45), "ENA")
                .appendField("IN1")
                .appendField(new Blockly.FieldNumber(8, 0, 45), "IN1")
                .appendField("IN2")
                .appendField(new Blockly.FieldNumber(9, 0, 45), "IN2")
                .appendField(new Blockly.FieldDropdown([
                    ["Forward", "FORWARD"],
                    ["Reverse", "REVERSE"],
                    ["Stop", "STOP"]
                ]), "DIR");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(30);
            this.setTooltip("Control a DC motor via L298N/L293D. Set ENA, IN1, IN2 pins.");
        }
    };

    Blockly.Blocks['mechanzo_servo'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Servo  Channel")
                .appendField(new Blockly.FieldNumber(0, 0, 15), "CHANNEL")
                .appendField("Angle")
                .appendField(new Blockly.FieldNumber(90, 0, 180), "ANGLE")
                .appendField("°");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(30);
            this.setTooltip("Set PCA9685 servo channel (0-15) to an angle (0-180°).");
        }
    };

    // --- Code Generators ---
    
    const arduinoGenerator = (typeof javascript !== 'undefined') ? javascript.javascriptGenerator : (Blockly.JavaScript || javascriptGenerator);
    const forBlock = arduinoGenerator.forBlock || arduinoGenerator;

    if (typeof arduinoGenerator.ORDER_NONE === 'undefined') {
        arduinoGenerator.ORDER_NONE = 99;
        arduinoGenerator.ORDER_ATOMIC = 0;
        arduinoGenerator.ORDER_EQUALITY = 7;
        arduinoGenerator.ORDER_RELATIONAL = 6;
        arduinoGenerator.ORDER_FUNCTION_CALL = 2;
    }

    forBlock['mechanzo_start'] = function(block) { return ""; };

    forBlock['mechanzo_repeat'] = function(block) {
        const times = block.getFieldValue('TIMES');
        const branch = arduinoGenerator.statementToCode(block, 'DO');
        const loopVar = 'i_' + block.id.replace(/\W/g, '');
        return `  for (int ${loopVar} = 0; ${loopVar} < ${times}; ${loopVar}++) {\n${branch}  }\n`;
    };

    forBlock['mechanzo_delay'] = function(block) {
        return `  delay(${block.getFieldValue('MS')});\n`;
    };

    forBlock['mechanzo_delay_s'] = function(block) {
        return `  delay(${block.getFieldValue('SEC')} * 1000);\n`;
    };

    forBlock['mechanzo_if'] = function(block) {
        const condition = arduinoGenerator.valueToCode(block, 'CONDITION', arduinoGenerator.ORDER_NONE) || 'false';
        const branch = arduinoGenerator.statementToCode(block, 'DO');
        return `  if (${condition}) {\n${branch}  }\n`;
    };

    forBlock['mechanzo_if_else'] = function(block) {
        const condition = arduinoGenerator.valueToCode(block, 'CONDITION', arduinoGenerator.ORDER_NONE) || 'false';
        const branch = arduinoGenerator.statementToCode(block, 'DO');
        const elseBranch = arduinoGenerator.statementToCode(block, 'ELSE');
        return `  if (${condition}) {\n${branch}  } else {\n${elseBranch}  }\n`;
    };

    forBlock['mechanzo_led'] = function(block) {
        const pin = block.getFieldValue('PIN');
        setupStatements.add(`  pinMode(${pin}, OUTPUT);`);
        return `  digitalWrite(${pin}, ${block.getFieldValue('STATE')});\n`;
    };

    forBlock['mechanzo_buzzer'] = function(block) {
        setupStatements.add(`  pinMode(17, OUTPUT);`);
        return `  digitalWrite(17, ${block.getFieldValue('STATE')});\n`;
    };

    forBlock['mechanzo_oled_print'] = function(block) {
        const val = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_NONE) || '""';
        requiredImports.add('#include <Wire.h>');
        requiredImports.add('#include <Adafruit_GFX.h>');
        requiredImports.add('#include <Adafruit_SSD1306.h>');
        globalDeclarations.add('Adafruit_SSD1306 oled(128, 64, &Wire, -1);');
        setupStatements.add('  Wire.begin(47, 48);');
        setupStatements.add('  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);');
        return `  oled.clearDisplay();\n  oled.setCursor(0, 0);\n  oled.println(${val});\n  oled.display();\n`;
    };

    forBlock['mechanzo_switch_pressed'] = function(block) {
        setupStatements.add('  pinMode(41, INPUT_PULLUP);');
        return ['(digitalRead(41) == LOW)', arduinoGenerator.ORDER_EQUALITY];
    };

    forBlock['mechanzo_ir_sensor'] = function(block) {
        const pin = block.getFieldValue('PIN');
        setupStatements.add(`  pinMode(${pin}, INPUT_PULLUP);`);
        return [`(digitalRead(${pin}) == LOW)`, arduinoGenerator.ORDER_EQUALITY];
    };

    forBlock['mechanzo_analog_sensor'] = function(block) {
        const channel = block.getFieldValue('CHANNEL');
        requiredImports.add('#include <Wire.h>');
        requiredImports.add('#include <Adafruit_ADS1X15.h>');
        globalDeclarations.add('Adafruit_ADS1115 ads;');
        setupStatements.add('  Wire.begin(47, 48);');
        setupStatements.add('  ads.begin();');
        setupStatements.add('  ads.setGain(GAIN_ONE);');
        return [`ads.readADC_SingleEnded(${channel})`, arduinoGenerator.ORDER_FUNCTION_CALL];
    };

    forBlock['mechanzo_digital_sensor'] = function(block) {
        const pin = block.getFieldValue('PIN');
        setupStatements.add(`  pinMode(${pin}, INPUT_PULLUP);`);
        return [`digitalRead(${pin})`, arduinoGenerator.ORDER_FUNCTION_CALL];
    };

    forBlock['mechanzo_ultrasonic'] = function(block) {
        const trig = block.getFieldValue('TRIG');
        const echo = block.getFieldValue('ECHO');
        setupStatements.add(`  pinMode(${trig}, OUTPUT);`);
        setupStatements.add(`  pinMode(${echo}, INPUT);`);
        const fnName = `readUltrasonic_${trig}_${echo}`;
        globalDeclarations.add(
            `float ${fnName}() {\n` +
            `  digitalWrite(${trig}, LOW); delayMicroseconds(2);\n` +
            `  digitalWrite(${trig}, HIGH); delayMicroseconds(10);\n` +
            `  digitalWrite(${trig}, LOW);\n` +
            `  long dur = pulseIn(${echo}, HIGH);\n` +
            `  return dur * 0.034 / 2;\n` +
            `}`
        );
        return [`${fnName}()`, arduinoGenerator.ORDER_FUNCTION_CALL];
    };

    forBlock['mechanzo_var_declare'] = function(block) {
        const type = block.getFieldValue('TYPE');
        const name = block.getFieldValue('NAME');
        const value = block.getFieldValue('VALUE');
        globalDeclarations.add(`${type} ${name} = ${value};`);
        return '';
    };

    forBlock['mechanzo_var_set'] = function(block) {
        const name = block.getFieldValue('NAME');
        const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_NONE) || '0';
        return `  ${name} = ${value};\n`;
    };

    forBlock['mechanzo_var_get'] = function(block) {
        const name = block.getFieldValue('NAME');
        return [name, arduinoGenerator.ORDER_ATOMIC];
    };

    forBlock['mechanzo_lcd_print'] = function(block) {
        const val = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_NONE) || '""';
        const row = block.getFieldValue('ROW');
        requiredImports.add('#include <Wire.h>');
        requiredImports.add('#include <LiquidCrystal_I2C.h>');
        globalDeclarations.add('LiquidCrystal_I2C lcd(0x27, 16, 2);');
        setupStatements.add('  Wire.begin(47, 48);');
        setupStatements.add('  lcd.init();');
        setupStatements.add('  lcd.backlight();');
        return `  lcd.setCursor(0, ${row});\n  lcd.print(${val});\n`;
    };

    forBlock['mechanzo_motor'] = function(block) {
        const ena = block.getFieldValue('ENA');
        const in1 = block.getFieldValue('IN1');
        const in2 = block.getFieldValue('IN2');
        const dir = block.getFieldValue('DIR');
        setupStatements.add(`  pinMode(${ena}, OUTPUT);`);
        setupStatements.add(`  pinMode(${in1}, OUTPUT);`);
        setupStatements.add(`  pinMode(${in2}, OUTPUT);`);
        setupStatements.add(`  digitalWrite(${ena}, HIGH);`);
        if (dir === 'FORWARD') {
            return `  digitalWrite(${in1}, HIGH);\n  digitalWrite(${in2}, LOW);\n`;
        } else if (dir === 'REVERSE') {
            return `  digitalWrite(${in1}, LOW);\n  digitalWrite(${in2}, HIGH);\n`;
        } else {
            return `  digitalWrite(${in1}, LOW);\n  digitalWrite(${in2}, LOW);\n`;
        }
    };

    forBlock['mechanzo_servo'] = function(block) {
        const channel = block.getFieldValue('CHANNEL');
        const angle = block.getFieldValue('ANGLE');
        requiredImports.add('#include <Wire.h>');
        requiredImports.add('#include <Adafruit_PWMServoDriver.h>');
        globalDeclarations.add('Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);');
        setupStatements.add('  Wire.begin(47, 48);');
        setupStatements.add('  pwm.begin();');
        setupStatements.add('  pwm.setPWMFreq(50);');
        const pulse = Math.round(150 + (angle / 180) * (600 - 150));
        return `  pwm.setPWM(${channel}, 0, ${pulse});\n`;
    };

    forBlock['mechanzo_read_analog'] = function(block) {
        const channel = block.getFieldValue('CHANNEL');
        requiredImports.add('#include <Wire.h>');
        requiredImports.add('#include <Adafruit_ADS1X15.h>');
        globalDeclarations.add('Adafruit_ADS1115 ads;');
        setupStatements.add('  Wire.begin(47, 48);');
        setupStatements.add('  ads.begin();');
        return [`ads.readADC_SingleEnded(${channel})`, arduinoGenerator.ORDER_FUNCTION_CALL];
    };

    forBlock['logic_compare'] = function(block) {
        const OP_MAP = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
        const operator = OP_MAP[block.getFieldValue('OP')];
        const order = (operator === '==' || operator === '!=') ? arduinoGenerator.ORDER_EQUALITY : arduinoGenerator.ORDER_RELATIONAL;
        const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || '0';
        const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || '0';
        return [argument0 + ' ' + operator + ' ' + argument1, order];
    };

    // --- Initialization & Orchestration ---

    const bTheme = (Blockly.Themes && Blockly.Themes.Dark) ? Blockly.Themes.Dark : null;

    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        scrollbars: true,
        trashcan: true,
        grid: { spacing: 25, length: 3, colour: '#1a1a1a', snap: true },
        zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        theme: bTheme
    });

    if (workspace.getTheme()) {
        workspace.getTheme().setComponentStyle('hat', 'cap');
    }

    function highlightCode(code) {
        if (!code) return "";
        let escaped = code.replace(/&/g, "___AMP___").replace(/</g, "___LT___").replace(/>/g, "___GT___");
        escaped = escaped
            .replace(/\/\/.*/g, '<span class="comment">$&</span>')
            .replace(/#include.*/g, '<span class="keyword">$&</span>')
            .replace(/\b(void|setup|loop|if|else|for|int|float|bool|String|long)\b/g, '<span class="keyword">$&</span>')
            .replace(/\b(digitalWrite|digitalRead|pinMode|delay|delayMicroseconds|pulseIn|begin|clearDisplay|setCursor|println|print|display|readADC_SingleEnded|setGain|setPWMFreq|setPWM|init|backlight)\b/g, '<span class="function">$&</span>')
            .replace(/\b\d+\b/g, '<span class="number">$&</span>')
            .replace(/[(){};,]/g, '<span class="punctuation">$&</span>')
            .replace(/\b(HIGH|LOW|OUTPUT|INPUT|INPUT_PULLUP|SSD1306_SWITCHCAPVCC|GAIN_ONE|Adafruit_ADS1115|LiquidCrystal_I2C|Adafruit_PWMServoDriver)\b/g, '<span class="number">$&</span>');
        return escaped.replace(/___AMP___/g, "&amp;").replace(/___LT___/g, "&lt;").replace(/___GT___/g, "&gt;");
    }

    function updateCode() {
        clearDependencies();
        
        // --- CRITICAL FIX: Initialize generator before use ---
        arduinoGenerator.init(workspace);
        
        const startBlocks = workspace.getBlocksByType('mechanzo_start', false);
        let loopCode = "";
        if (startBlocks.length > 0) {
            const nextBlock = startBlocks[0].getNextBlock();
            if (nextBlock) loopCode = arduinoGenerator.blockToCode(nextBlock);
        }
        let output = "// Auto-generated by MechanzO Block IDE\n\n";
        if (requiredImports.size > 0) output += Array.from(requiredImports).join('\n') + '\n\n';
        if (globalDeclarations.size > 0) output += Array.from(globalDeclarations).join('\n') + '\n\n';
        output += "void setup() {\n";
        if (setupStatements.size > 0) output += Array.from(setupStatements).join('\n') + '\n';
        else output += "  // No setup needed\n";
        output += "}\n\nvoid loop() {\n" + (loopCode || "  // add blocks to program\n") + "}\n";
        const codeEl = document.getElementById('codeOutput');
        if (codeEl) { codeEl.innerHTML = highlightCode(output); codeEl.classList.remove('placeholder'); }
    }

    workspace.addChangeListener(() => {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) emptyState.style.display = (workspace.getAllBlocks(false).length > 0) ? 'none' : 'block';
    });

    document.getElementById('generateBtn').addEventListener('click', () => {
        updateCode();
        const btn = document.getElementById('generateBtn');
        const originalText = btn.textContent;
        btn.textContent = "GENERATED!";
        setTimeout(() => btn.textContent = originalText, 1000);
    });

    document.getElementById('themeToggle').addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        this.textContent = isLight ? "☀️" : "🌙";
        if (Blockly.Themes) {
            workspace.setTheme(isLight ? Blockly.Themes.Classic : (Blockly.Themes.Dark || Blockly.Themes.Classic));
        }
    });

    // --- Web Serial Flashing Pipeline ---
    const flashBtn = document.getElementById('flashBtn');
    const flashStatus = document.getElementById('flashStatus');

    flashBtn.addEventListener('click', async () => {
        const code = document.getElementById('codeOutput').textContent;
        console.log("Code being sent to server:\n", code);
        if (!code || code.includes("// build your program")) {
            alert("Please generate code first!");
            return;
        }

        const originalText = flashBtn.textContent;
        let port = null;
        try {
            port = await navigator.serial.requestPort();
            flashBtn.textContent = "⏳ Compiling...";
            flashBtn.disabled = true;
            flashStatus.textContent = "Waking up compiler server...";

            const compileTimeout = setTimeout(() => {
                flashStatus.textContent = "Server is waking up, please wait (~30s)...";
            }, 5000);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000);

            let response;
            try {
                response = await fetch('https://mechanoz-server-production.up.railway.app/compile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: code }),
                    signal: controller.signal
                });
            } finally {
                clearTimeout(compileTimeout);
                clearTimeout(timeoutId);
            }

            flashStatus.textContent = "Compiling...";
            const data = await response.json();
            console.log("Server response:", data);
            if (!response.ok || !data.binary) {
                const detail = data.stderr || data.output || data.error || "Compilation failed";
                throw new Error(detail);
            }

            const binaryString = atob(data.binary);

            flashBtn.textContent = "🔥 Flashing...";
            flashStatus.textContent = "Connecting to ESP32...";

            const { ESPLoader, Transport } = await import('./esptool-bundle.js');

            const transport = new Transport(port, true);
            const esploader = new ESPLoader({
                transport,
                baudrate: 115200,
                terminal: {
                    clean() {},
                    writeLine(data) { console.log(data); },
                    write(data) { console.debug(data); }
                }
            });

            await esploader.main();

            flashStatus.textContent = "Writing to ESP32...";
            await esploader.writeFlash({
                fileArray: [{ data: binaryString, address: 0x10000 }],
                flashSize: 'keep',
                flashMode: 'keep',
                flashFreq: 'keep',
                eraseAll: false,
                compress: true
            });

            // Exit bootloader — manual DTR/RTS toggle for ESP32-S3
            await transport.device.setSignals({ dataTerminalReady: false, requestToSend: true });
            await new Promise(r => setTimeout(r, 100));
            await transport.device.setSignals({ dataTerminalReady: false, requestToSend: false });
            await new Promise(r => setTimeout(r, 100));

            // Set success state BEFORE disconnect — disconnect can throw and we don't care
            flashBtn.textContent = "✅ Success";
            flashStatus.textContent = "✅ Flashed Successfully";

            try { await transport.disconnect(); } catch (_) {}

        } catch (err) {
            console.error(err);
            if (port) { try { await port.close(); } catch (_) {} }
            flashStatus.textContent = (err.name === 'NotFoundError') ? "Flash aborted: No port selected." : `Error: ${err.message}`;
            flashBtn.textContent = "❌ Failed";
        } finally {
            setTimeout(() => { flashBtn.textContent = originalText; flashBtn.disabled = false; }, 3000);
        }
    });

    document.getElementById('copyBtn').addEventListener('click', function() {
        const code = document.getElementById('codeOutput').textContent;
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                const originalText = this.textContent;
                this.textContent = "COPIED!";
                setTimeout(() => this.textContent = originalText, 2000);
            });
        }
    });

    setInterval(() => {
        fetch('https://mechanoz-server-production.up.railway.app/health').catch(() => {});
    }, 600000);

    // --- Firebase Auth & Storage Integration ---
    const authOverlay = document.getElementById('authOverlay');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authError = document.getElementById('authError');
    const submitBtn = document.getElementById('submitBtn');
    const googleBtn = document.getElementById('googleBtn');
    const toggleLink = document.getElementById('toggleLink');
    const userStatus = document.getElementById('userStatus');
    const userEmail = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');

    let isLoginMode = true;
    let currentUser = null;

    if (window.location.protocol === 'file:') {
        if (authError) authError.textContent = "ERROR: FIREBASE REQUIRES A LOCAL SERVER (LIVE SERVER)";
        if (submitBtn) submitBtn.disabled = true;
        if (googleBtn) googleBtn.disabled = true;
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("Google Login Attempt started...");
            try {
                if (authError) authError.textContent = "";
                googleBtn.disabled = true;
                googleBtn.textContent = "LINKING...";
                await loginWithGoogle();
                console.log("Google Login Complete!");
            } catch (err) {
                console.error("GOOGLE AUTH ERROR:", err);
                const code = err.code ? `[${err.code}] ` : "";
                if (authError) authError.textContent = (code + err.message).toUpperCase();
                googleBtn.disabled = false;
                googleBtn.textContent = "CONTINUE WITH GOOGLE";
            }
        });
    }

    const handleAuthToggle = (e) => {
        if (e) e.preventDefault();
        isLoginMode = !isLoginMode;
        console.log("Mode switched to:", isLoginMode ? "Login" : "Sign Up");
        if (authError) authError.textContent = "";
        
        authTitle.textContent = isLoginMode ? 'LOGIN' : 'SIGN UP';
        submitBtn.textContent = isLoginMode ? 'ENTER REALM' : 'JOIN ADVENTURE';
        
        const preText = document.getElementById('togglePreText');
        if (preText) preText.textContent = isLoginMode ? 'New explorer? ' : 'Already a member? ';
        if (toggleLink) toggleLink.textContent = isLoginMode ? 'Sign Up' : 'Login';
    };

    if (toggleLink) {
        toggleLink.addEventListener('click', handleAuthToggle);
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (authError) authError.textContent = "";
            
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;

            console.log(`Submitting ${isLoginMode ? 'Login' : 'Sign Up'} for ${email}...`);

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "WAIT...";
                if (isLoginMode) {
                    await login(email, password);
                } else {
                    await signUp(email, password);
                    alert("Account Created! Welcome to the realm.");
                }
            } catch (err) {
                console.error("AUTH ERROR:", err);
                const code = err.code ? `[${err.code}] ` : "";
                if (authError) authError.textContent = (code + err.message).toUpperCase();
                submitBtn.disabled = false;
                submitBtn.textContent = isLoginMode ? 'ENTER REALM' : 'JOIN ADVENTURE';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout());
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            if (authOverlay) authOverlay.classList.add('hidden');
            if (userStatus) userStatus.classList.remove('hidden');
            if (userEmail) userEmail.textContent = user.email.split('@')[0].toUpperCase();
        } else {
            currentUser = null;
            if (authOverlay) authOverlay.classList.remove('hidden');
            if (userStatus) userStatus.classList.add('hidden');
            if (workspace) workspace.clear();
            submitBtn.disabled = false;
            submitBtn.textContent = isLoginMode ? 'ENTER REALM' : 'JOIN ADVENTURE';
            googleBtn.disabled = false;
            googleBtn.textContent = "CONTINUE WITH GOOGLE";
        }
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            if (!currentUser) return;
            const xml = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xml);
            
            try {
                saveBtn.textContent = "SAVING...";
                await setDoc(doc(db, "projects", currentUser.uid), {
                    xml: xmlText,
                    updatedAt: new Date()
                });
                saveBtn.textContent = "SAVED!";
                setTimeout(() => saveBtn.textContent = "Save", 2000);
            } catch (err) {
                alert("Save failed: " + err.message);
                saveBtn.textContent = "Save";
            }
        });
    }

    if (loadBtn) {
        loadBtn.addEventListener('click', async () => {
            if (!currentUser) return;
            try {
                loadBtn.textContent = "LOADING...";
                const docSnap = await getDoc(doc(db, "projects", currentUser.uid));
                if (docSnap.exists()) {
                    const xmlText = docSnap.data().xml;
                    const xml = Blockly.Xml.textToDom(xmlText);
                    workspace.clear();
                    Blockly.Xml.domToWorkspace(xml, workspace);
                    loadBtn.textContent = "LOADED!";
                } else {
                    alert("No saved project found.");
                }
                setTimeout(() => loadBtn.textContent = "Load", 2000);
            } catch (err) {
                alert("Load failed: " + err.message);
                loadBtn.textContent = "Load";
            }
        });
    }

});
