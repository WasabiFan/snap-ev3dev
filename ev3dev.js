///<reference path="node.d.ts" />
/*
* This is a language binding for the ev3dev devce APIs. More info at: https://github.com/ev3dev/ev3dev-lang
* This library complies with spec v0.9.1
*/
var fs = require('fs');
var path = require('path');

//var Enumerable: linqjs.EnumerableStatic = require('linq');
/* CONSTANTS */
var ports = {
    INPUT_AUTO: undefined,
    OUTPUT_AUTO: undefined,
    INPUT_1: 'in1',
    INPUT_2: 'in2',
    INPUT_3: 'in3',
    INPUT_4: 'in4',
    OUTPUT_A: 'outA',
    OUTPUT_B: 'outB',
    OUTPUT_C: 'outC',
    OUTPUT_D: 'outD'
};
///<reference path="node.d.ts" />
///<reference path="include.ts" />
var XError = (function () {
    function XError() {
        var tsargs = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            tsargs[_i] = arguments[_i + 0];
        }
        Error.apply(this, arguments);
        return new Error();
    }
    return XError;
})();

XError['prototype'] = new Error();

var TraceError = (function () {
    function TraceError(message, innerError) {
        this.message = message;
        this.innerError = innerError;
    }
    TraceError.prototype.toString = function () {
        var str = this.message.trim() + '\r\nInner error:\r\n';

        var innerLines = this.innerError.toString().split('\r\n');
        for (var i in innerLines) {
            innerLines[i] = '  ' + innerLines[i];
        }
        return str + innerLines.join('\r\n');
    };
    return TraceError;
})();

var Device = (function () {
    function Device() {
        this.connected = false;
    }
    //private preloadedValues: any;
    Device.prototype.connect = function (deviceRootPath /*, preloadProperties: string[]*/ ) {
        this.deviceRoot = deviceRootPath;

        ////Preload specified properties, so that properties that don't change are fast to access
        //for (var i in preloadProperties) {
        //    var propertyName = preloadProperties[i];
        //    try {
        //        this.preloadedValues[propertyName] = this.readProperty(propertyName);
        //    }
        //    catch (e) {
        //        this.connected = false;
        //        return;
        //    }
        //}
        this.connected = true;
    };

    Device.prototype.constructPropertyPath = function (property) {
        return path.join(this.deviceRoot, property);
    };

    Device.prototype.readNumber = function (property) {
        var value = this.readProperty(property);

        if (typeof value !== 'number')
            return NaN;

        return value;
    };

    Device.prototype.getNumber = function (property) {
        //if (typeof this.preloadedValues[property] !== 'undefined')
        //    return this.preloadedValues[property];
        //else
        return this.readNumber(property);
    };

    Device.prototype.readString = function (property) {
        var value = this.readProperty(property);
        return String(value);
    };

    Device.prototype.getString = function (property) {
        //if (typeof this.preloadedValues[property] !== 'undefined')
        //    return this.preloadedValues[property];
        //else
        return this.readString(property);
    };

    Device.prototype.readProperty = function (property) {
        if (!this.connected)
            throw new Error('You must be connected to a device before you can read from it.');

        var rawValue;
        var propertyPath = this.constructPropertyPath(property);

        try  {
            rawValue = fs.readFileSync(propertyPath).toString();
        } catch (e) {
            this.connected = false;
            throw new TraceError('There was an error while reading from the property file "' + propertyPath + '".', e);
        }

        rawValue = rawValue.trim();
        var numValue = Number(rawValue);

        if (isNaN(numValue))
            return rawValue;
        else
            return numValue;
    };

    Device.prototype.getProperty = function (property) {
        //if (typeof this.preloadedValues[property] !== 'undefined')
        //    return this.preloadedValues[property];
        //else
        return this.readProperty(property);
    };

    Device.prototype.setProperty = function (property, value) {
        if (!this.connected)
            throw new Error('You must be connected to a device before you can write to it.');

        var propertyPath = this.constructPropertyPath(property);

        try  {
            fs.writeFileSync(propertyPath, value.toString());
        } catch (e) {
            this.connected = false;
            throw new TraceError('There was an error while writing to the property file "' + propertyPath + '".', e);
        }
    };

    Device.prototype.setNumber = function (property, value) {
        this.setProperty(property, value);
    };

    Device.prototype.setString = function (property, value) {
        this.setProperty(property, value);
    };
    return Device;
})();
///<reference path="node.d.ts" />
///<reference path="include.ts" />
///<reference path="io.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Motor = (function (_super) {
    __extends(Motor, _super);
    function Motor(port, type) {
        _super.call(this);
        this.motorDeviceDir = '/sys/class/tacho-motor/';
        this._deviceIndex = -1;

        this.port = port;
        var rootPath;

        try  {
            var availableDevices = fs.readdirSync(this.motorDeviceDir);
            for (var i in availableDevices) {
                var file = availableDevices[i];

                rootPath = path.join(this.motorDeviceDir, file);
                var portName = fs.readFileSync(path.join(rootPath, this.motorProperties.portName)).toString().trim();

                var motorType = fs.readFileSync(path.join(rootPath, this.motorProperties.type)).toString().trim();

                var satisfiesCondition = ((port == ports.OUTPUT_AUTO) || (port == undefined) || (portName === port)) && ((type == undefined || type == '') || motorType == type);

                if (satisfiesCondition) {
                    this._deviceIndex = Number(file.substring('tacho-motor'.length));
                    break;
                }
            }

            if (this.deviceIndex == -1) {
                this.connected = false;
                return;
            }
        } catch (e) {
            console.log(e);
            this.connected = false;
            return;
        }

        this.connect(rootPath);
    }
    Object.defineProperty(Motor.prototype, "deviceIndex", {
        get: function () {
            return this._deviceIndex;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Motor.prototype, "motorProperties", {
        get: function () {
            return {
                portName: 'port_name',
                dutyCycle: 'duty_cyle',
                dutyCycleSp: 'duty_cycle_sp',
                position: 'position',
                positionMode: 'position_mode',
                positionSp: 'position_sp',
                pulsesPerSecond: 'pulses_per_second',
                pulsesPerSecondSp: 'pulses_per_second_sp',
                rampDownSp: 'ramp_down_sp',
                rampUpSp: 'ramp_up_sp',
                regulationMode: 'regulation_mode',
                reset: 'reset',
                run: 'run',
                runMode: 'run_mode',
                speedRegulationP: 'speed_regulation_P',
                speedRegulationI: 'speed_regulation_I',
                speedRegulationD: 'speed_regulation_D',
                speedRegulationK: 'speed_regulation_K',
                state: 'state',
                stopMode: 'stop_mode',
                stopModes: 'stop_modes',
                timeSp: 'time_sp',
                type: 'type'
            };
        },
        enumerable: true,
        configurable: true
    });

    Motor.prototype.reset = function () {
        this.setNumber(this.motorProperties.reset, 1);
    };

    Object.defineProperty(Motor.prototype, "portName", {
        //PROPERTIES
        get: function () {
            return this.getProperty(this.motorProperties.portName);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Motor.prototype, "dutyCycle", {
        get: function () {
            return this.getNumber(this.motorProperties.dutyCycle);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Motor.prototype, "dutyCycleSp", {
        get: function () {
            return this.getNumber(this.motorProperties.dutyCycleSp);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.dutyCycleSp, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "position", {
        get: function () {
            return this.getNumber(this.motorProperties.position);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.position, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "positionMode", {
        get: function () {
            return this.getString(this.motorProperties.positionMode);
        },
        set: function (value) {
            this.setString(this.motorProperties.positionMode, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "positionSp", {
        get: function () {
            return this.getNumber(this.motorProperties.positionSp);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.positionSp, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "pulsesPerSecond", {
        get: function () {
            return this.getNumber(this.motorProperties.pulsesPerSecond);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Motor.prototype, "pulsesPerSecondSp", {
        get: function () {
            return this.getNumber(this.motorProperties.pulsesPerSecondSp);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.pulsesPerSecondSp, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "rampDownSp", {
        get: function () {
            return this.getNumber(this.motorProperties.rampDownSp);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.rampDownSp, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "rampUpSp", {
        get: function () {
            return this.getNumber(this.motorProperties.rampUpSp);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.rampUpSp, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "regulationMode", {
        get: function () {
            return this.getString(this.motorProperties.regulationMode);
        },
        set: function (value) {
            this.setString(this.motorProperties.regulationMode, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "run", {
        get: function () {
            return this.getNumber(this.motorProperties.run);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.run, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "runMode", {
        get: function () {
            return this.getString(this.motorProperties.runMode);
        },
        set: function (value) {
            this.setString(this.motorProperties.runMode, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "speedRegulationP", {
        get: function () {
            return this.getNumber(this.motorProperties.speedRegulationP);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.speedRegulationP, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "speedRegulationI", {
        get: function () {
            return this.getNumber(this.motorProperties.speedRegulationI);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.speedRegulationI, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "speedRegulationD", {
        get: function () {
            return this.getNumber(this.motorProperties.speedRegulationD);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.speedRegulationD, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "speedRegulationK", {
        get: function () {
            return this.getNumber(this.motorProperties.speedRegulationK);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.speedRegulationK, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "state", {
        get: function () {
            return this.getString(this.motorProperties.state);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Motor.prototype, "stopMode", {
        get: function () {
            return this.getString(this.motorProperties.stopMode);
        },
        set: function (value) {
            this.setString(this.motorProperties.stopMode, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "stopModes", {
        get: function () {
            return this.getString(this.motorProperties.stopModes).split(' ');
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Motor.prototype, "timeSp", {
        get: function () {
            return this.getNumber(this.motorProperties.timeSp);
        },
        set: function (value) {
            this.setNumber(this.motorProperties.timeSp, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Motor.prototype, "type", {
        get: function () {
            return this.getString(this.motorProperties.type);
        },
        enumerable: true,
        configurable: true
    });
    return Motor;
})(Device);
///<reference path="node.d.ts" />
///<reference path="include.ts" />
///<reference path="io.ts" />
var Sensor = (function (_super) {
    __extends(Sensor, _super);
    function Sensor(port, types, i2cAddress) {
        _super.call(this);
        this.sensorDeviceDir = '/sys/class/msensor/';
        this.sensorTypes = [];
        this._deviceIndex = -1;

        this.port = port;
        var rootPath;

        try  {
            var availableDevices = fs.readdirSync(this.sensorDeviceDir);
            for (var i in availableDevices) {
                var file = availableDevices[i];

                rootPath = path.join(this.sensorDeviceDir, file);

                var portName = fs.readFileSync(path.join(rootPath, this.sensorProperties.portName)).toString().trim();

                var typeName = fs.readFileSync(path.join(rootPath, this.sensorProperties.name)).toString().trim();

                var i2cDeviceAddress = fs.readFileSync(path.join(rootPath, this.sensorProperties.address)).toString().trim();

                var satisfiesCondition = ((port == ports.INPUT_AUTO) || (port == undefined) || (portName === port)) && ((types == undefined || types == []) || types.indexOf(typeName) != -1) && ((i2cAddress == undefined) || (i2cAddress == i2cDeviceAddress));

                if (satisfiesCondition) {
                    this._deviceIndex = Number(file.substring('sensor'.length));
                    break;
                }
            }

            if (this.deviceIndex == -1) {
                this.connected = false;
                return;
            }
        } catch (e) {
            console.log(e);
            this.connected = false;
            return;
        }

        this.connect(rootPath);
    }
    Object.defineProperty(Sensor.prototype, "deviceIndex", {
        get: function () {
            return this._deviceIndex;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Sensor.prototype, "sensorProperties", {
        get: function () {
            return {
                portName: 'port_name',
                numValues: 'num_values',
                name: 'name',
                address: 'address',
                mode: 'mode',
                modes: 'modes',
                value: 'value',
                dp: 'dp',
                pollMS: 'poll_ms',
                fwVersion: 'fw_version'
            };
        },
        enumerable: true,
        configurable: true
    });

    Sensor.prototype.getValue = function (valueIndex) {
        return this.getNumber(this.sensorProperties.value + valueIndex);
    };

    Sensor.prototype.getFloatValue = function (valueIndex) {
        return this.getNumber(this.sensorProperties.value + valueIndex) / Math.pow(10, this.getNumber(this.sensorProperties.dp));
    };

    Object.defineProperty(Sensor.prototype, "portName", {
        //PROPERTIES
        get: function () {
            return this.getProperty(this.sensorProperties.portName);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Sensor.prototype, "numValues", {
        get: function () {
            return this.getNumber(this.sensorProperties.numValues);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Sensor.prototype, "typeName", {
        get: function () {
            return this.getNumber(this.sensorProperties.name);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Sensor.prototype, "mode", {
        get: function () {
            return this.getProperty(this.sensorProperties.mode);
        },
        set: function (value) {
            this.setProperty(this.sensorProperties.mode, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Sensor.prototype, "modes", {
        get: function () {
            return this.getProperty(this.sensorProperties.modes).split(' ');
        },
        enumerable: true,
        configurable: true
    });
    return Sensor;
})(Device);

var I2CSensor = (function (_super) {
    __extends(I2CSensor, _super);
    function I2CSensor(port, types, i2cAddress) {
        _super.call(this, port, types, i2cAddress);
    }
    Object.defineProperty(I2CSensor.prototype, "pollMS", {
        get: function () {
            return this.getProperty(this.sensorProperties.pollMS);
        },
        set: function (value) {
            this.setProperty(this.sensorProperties.pollMS, value);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(I2CSensor.prototype, "fwVersion", {
        get: function () {
            return this.getProperty(this.sensorProperties.fwVersion);
        },
        enumerable: true,
        configurable: true
    });
    return I2CSensor;
})(Sensor);
///<reference path="node.d.ts" />
///<reference path="include.ts" />
///<reference path="io.ts" />
var PowerSupply = (function (_super) {
    __extends(PowerSupply, _super);
    function PowerSupply(deviceName) {
        _super.call(this);
        this.powerDeviceDir = '/sys/class/power_supply/';
        this.deviceName = 'legoev3-battery';

        this.deviceName = deviceName;
        var rootPath;

        try  {
            var availableDevices = fs.readdirSync(this.powerDeviceDir);

            if (availableDevices.indexOf(this.deviceName) == -1) {
                this.connected = false;
                return;
            }
        } catch (e) {
            console.log(e);
            this.connected = false;
            return;
        }

        this.connect(rootPath);
    }
    Object.defineProperty(PowerSupply.prototype, "powerProperties", {
        get: function () {
            return {
                currentNow: 'current_now',
                voltageNow: 'voltage_now',
                voltageMaxDesign: 'voltage_min_design',
                voltageMinDesign: 'voltage_max_design',
                technology: 'technology',
                type: 'type'
            };
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "currentNow", {
        //PROPERTIES
        get: function () {
            return this.getNumber(this.powerProperties.currentNow);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "voltageNow", {
        get: function () {
            return this.getNumber(this.powerProperties.voltageNow);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "voltageMaxDesign", {
        get: function () {
            return this.getNumber(this.powerProperties.voltageMaxDesign);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "voltageMinDesign", {
        get: function () {
            return this.getNumber(this.powerProperties.voltageMaxDesign);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "technology", {
        get: function () {
            return this.getProperty(this.powerProperties.technology);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "type", {
        get: function () {
            return this.getProperty(this.powerProperties.type);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "voltageVolts", {
        get: function () {
            return this.voltageNow / 1000000;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(PowerSupply.prototype, "currentAmps", {
        get: function () {
            return this.currentNow / 1000000;
        },
        enumerable: true,
        configurable: true
    });
    return PowerSupply;
})(Device);
///<reference path="node.d.ts" />
///<reference path="include.ts" />
///<reference path="io.ts" />
///<reference path="motor.ts" />
///<reference path="sensor.ts" />
module.exports.ports = ports;

/* CLASS EXPORTS */
module.exports.Device = Device;
module.exports.Motor = Motor;
module.exports.Sensor = Sensor;
