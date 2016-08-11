maze.io
==========

Microservice framework based on Seneca microservice framework for bootstrapping your application code

### Provides

* Sensors to metrics collectors via http
* Propagates log context back and forth between http/https calls for tracking purposes
* Provide health check for itself via http
* Exposes predefined API as a stats API accessible via seneca-mesh network
* Should limit incoming request to local (configurable)

### Usage

#### Run
```bash
$> node app-pilot app.js
```

#### Getting stats from the pilot

Directly on the box

```js
require('app-pilot/stats/fetcher').get('cpu', function (err, stats) {
    console.log(err, stats);
});

```
