# mpr-6zhmaut-api

Monoprice sells this wacky [6 zone amp](https://www.monoprice.com/product?p_id=10761) with a serial interface. This tiny project wraps the serial interface with a JSON API.

## Installation

    npm install

## Running the server

    PORT=8181 npm start

### API

#### GET /zones

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

#### GET /zones/:zone

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

#### GET /zones/:zone/:attribute

Return the value of a specific attribute in a zone as plain text.
Valid attributes are:

    pa (send zone 1 to all outputs)
    power / pr
    mute / mu
    dt (??)
    volume / vo
    treble / tr
    bass / bs
    balance / bl
    channel / source / ch
    keypad status / ls

    $ curl 192.168.1.254:8181/zones/11/bass
    10

#### POST /zones/:zone/:attribute

Update a zone's attribute using the plain-text value of the body.

    pa (send zone 1 to all outputs)
    power / pr
    mute / mu
    dt (??)
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

### Contributions

* fork
* create a feature branch
* open a Pull Request
