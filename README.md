# mpr-6zhmaut-api

Monoprice sells this wacky [6 zone amp](https://www.monoprice.com/product?p_id=10761) with a serial interface. This tiny project wraps the serial interface with a JSON API.

[A detailed walk-through is available](https://chrisschuld.com/2019/07/decorating-the-monoprice-6-zone-home-audio-multizone-controller/) illustrating the process to use this API easily on a Raspberry Pi

## Installation

    npm install

## Environment Variables

`DEVICE = <string>` - the serial port device name (defaults to /dev/ttyUSB0)
`BAUDRATE = <integer>` - the baud rate to use to connect to the device (defaults to 9600)
`PORT = <integer>` - port for API to listen on (defaults to 8181)
`AMPCOUNT = <1|2|3>` - the number of amps (you can slave up to two additional amps) (defaults to 1)
`REQUERY = <true|false>` - re-query the keypads before responding to a /zones request (defaults to false)
`CORS = <true|false>` - respond to a CORS request with an `Access-Control-Allow-Origin=*` (defaults to false)

## Running the server

    PORT=8181 npm start

or using more environment variables:

    PORT=8181 AMPCOUNT=2 REQUERY=false BAUDRATE=115200 CORS=false npm start

## Updating the Baud Rate

You can update the baud rate of the controller to one of the following rates: 9600, 19200, 38400, 57600, 115200, 230400

By default, at power loss, the device is set to run at 9600 BAUD.  You can adjust it using the `updateBaudRate.js` via npm run-script *(or directly with node)*.

```
OLDBAUDRATE=9600 NEWBAUDRATE=115200 npm run-script baudrate
```

Notes:
+ To reset the baud rate remove power from the controller for 30 seconds - it will reset to 9600 BAUD
+ Running `npm run-script baudrate` with the incorrect connection baud rate will not cause it to lock so intialization scripting could be created to reset the baudrate before the API enables.

### Environment Variables for updateBaudRate.js

`DEVICE = <string>` - the serial port device name (defaults to /dev/ttyUSB0)
`OLDBAUDRATE = <integer>` - the current baud rate of the controller (the rate used to initially connect to the device)
`NEWBAUDRATE = <integer>` - the desired baud rate

## API

### GET /zones

```js
[
  {
    "zone": "11",
    "pa": "00",
    "pr": "01",
    "mu": "00",
    "dt": "00",
    "vo": "15",
    "tr": "10",
    "bs": "10",
    "bl": "10",
    "ch": "01",
    "ls": "00"
  },
  {
    "zone": "12",
    "pa": "00",
    "pr": "01",
    "mu": "00",
    "dt": "00",
    "vo": "15",
    "tr": "10",
    "bs": "10",
    "bl": "10",
    "ch": "01",
    "ls": "00"
  },
  {
    "zone": "13",
    "pa": "00",
    "pr": "01",
    "mu": "00",
    "dt": "00",
    "vo": "15",
    "tr": "10",
    "bs": "10",
    "bl": "10",
    "ch": "01",
    "ls": "00"
  },
  {
    "zone": "14",
    "pa": "00",
    "pr": "01",
    "mu": "00",
    "dt": "00",
    "vo": "10",
    "tr": "10",
    "bs": "12",
    "bl": "10",
    "ch": "02",
    "ls": "00"
  },
  {
    "zone": "15",
    "pa": "00",
    "pr": "01",
    "mu": "00",
    "dt": "00",
    "vo": "20",
    "tr": "07",
    "bs": "07",
    "bl": "10",
    "ch": "01",
    "ls": "00"
  },
  {
    "zone": "16",
    "pa": "00",
    "pr": "01",
    "mu": "00",
    "dt": "00",
    "vo": "21",
    "tr": "07",
    "bs": "07",
    "bl": "10",
    "ch": "01",
    "ls": "00"
  }
]
```

### GET /zones/:zone

Returns the current status of a specific zone.

```js
{
  "zone": "11",
  "pa": "00",
  "pr": "01",
  "mu": "00",
  "dt": "00",
  "vo": "15",
  "tr": "10",
  "bs": "10",
  "bl": "10",
  "ch": "01",
  "ls": "00"
}
```

### GET /zones/:zone/:attribute

Return the value of a specific attribute in a zone as plain text.
Valid attributes are:

    pa (send zone 1 to all outputs)
    power / pr
    mute / mu
    do not disturb / dt
    volume / vo
    treble / tr
    bass / bs
    balance / bl
    channel / source / ch
    keypad status / ls

    $ curl 192.168.1.254:8181/zones/11/bass
    10

### POST /zones/:zone/:attribute

Update a zone's attribute using the plain-text value of the body.

    pa (send zone 1 to all outputs)
    power / pr
    mute / mu
    do not disturb / dt
    volume / vo
    treble / tr
    bass / bs
    balance / bl
    channel / source / ch

Here's an example where we turn the bass of zone 11 up:

```
$ curl 192.168.1.254:8181/zones/11
{"zone":"11","pa":"00","pr":"01","mu":"00","dt":"00","vo":"15","tr":"10","bs":"10","bl":"10","ch":"01","ls":"00"}
$ curl -X POST -d '12' 192.168.1.254:8181/zones/11/bass
{"zone":"11","pa":"00","pr":"01","mu":"00","dt":"00","vo":"15","tr":"10","bs":"12","bl":"10","ch":"01","ls":"00"}
```

## Device Manual

The manual for the [6 zone amp](https://www.monoprice.com/product?p_id=10761) is available (via Monoprice)[https://downloads.monoprice.com/files/manuals/10761_Manual_141028.pdf]

## Contributions

* fork
* create a feature branch
* open a Pull Request
