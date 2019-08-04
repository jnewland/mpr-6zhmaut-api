const SerialPort = require("serialport");
const OldBaudRate = parseInt(process.env.OLDBAUDRATE || 9600);
const NewBaudRate = parseInt(process.env.NEWBAUDRATE || 9600);
const device = process.env.DEVICE || "/dev/ttyUSB0";

var connection = new SerialPort(device, {
  baudRate: OldBaudRate,
});

console.log('Connecting at: ' + OldBaudRate);
if (![9600, 19200, 38400, 57600, 115200, 230400].includes(NewBaudRate)) {
  console.warn('ERROR: BAUD Rate not a valid value, please use: 9600, 19200, 38400, 57600, 115200 or 230400]');
}
else {
  connection.on("open", function () {
    let writeAndDrain = (data, callback) => {
      connection.write(data)
      connection.drain(callback)
    }
    writeAndDrain("<" + NewBaudRate + "\r", () => { console.log('Update Complete'); connection.close(); });
    console.log("Wrote: <" + NewBaudRate);
  });
}