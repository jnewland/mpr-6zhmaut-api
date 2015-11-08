# mpr-6zhmaut-api

Monoprice sells this wacky [6 zone amp](https://www.monoprice.com/product?p_id=10761) with a serial interface. This tiny project wraps the serial interface with a JSON API.

## Installation

    npm install

## Running the server

    npm start

### API

#### GET /zones

```js
[
  {
    "zone": "11",
    "pa": "00",
    "power": "01",
    "mute": "00",
    "dt": "00",
    "volume": "20",
    "treble": "10",
    "bass": "10",
    "balance": "10",
    "channel": "01",
    "keypad": "00"
  },
  {
    "zone": "12",
    "pa": "00",
    "power": "01",
    "mute": "00",
    "dt": "00",
    "volume": "20",
    "treble": "07",
    "bass": "07",
    "balance": "10",
    "channel": "01",
    "keypad": "00"
  },
  {
    "zone": "13",
    "pa": "00",
    "power": "01",
    "mute": "00",
    "dt": "00",
    "volume": "20",
    "treble": "07",
    "bass": "07",
    "balance": "10",
    "channel": "01",
    "keypad": "00"
  },
  {
    "zone": "14",
    "pa": "00",
    "power": "01",
    "mute": "00",
    "dt": "00",
    "volume": "20",
    "treble": "07",
    "bass": "07",
    "balance": "10",
    "channel": "01",
    "keypad": "00"
  },
  {
    "zone": "15",
    "pa": "00",
    "power": "01",
    "mute": "00",
    "dt": "00",
    "volume": "20",
    "treble": "07",
    "bass": "07",
    "balance": "10",
    "channel": "01",
    "keypad": "00"
  },
  {
    "zone": "16",
    "pa": "00",
    "power": "01",
    "mute": "00",
    "dt": "00",
    "volume": "21",
    "treble": "07",
    "bass": "07",
    "balance": "10",
    "channel": "01",
    "keypad": "00"
  }
]
```

#### GET /zones/:zone

Returns the current status of a specific zone.

```js
{
  "zone": "11",
  "pa": "00",
  "power": "01",
  "mute": "00",
  "dt": "00",
  "volume": "20",
  "treble": "10",
  "bass": "10",
  "balance": "10",
  "channel": "01",
  "keypad": "00"
}
```

#### PUT /zones/:zone/:action

Sends the specified control action to the given zone using the plain-text value of the body. Valid control actions are:

    pa
    power / pr
    mute / mu
    dt
    volume / vo
    treble / tr
    bass / bs
    balance / bl
    channel / source / ch

Here's an example where we turn the bass of zone 11 up:

```
$ curl 192.168.1.254:8181/zones/11
{"zone":"11","pa":"00","power":"01","mute":"00","dt":"00","volume":"20","treble":"10","bass":"10","balance":"10","channel":"01","keypad":"00"} 
$ curl -X PUT -d '12' 192.168.1.254:8181/zones/11/bass
{"zone":"11","pa":"00","power":"01","mute":"00","dt":"00","volume":"20","treble":"10","bass":"12","balance":"10","channel":"01","keypad":"00"}
```

### Contributions

* fork
* create a feature branch
* open a Pull Request
