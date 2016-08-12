maze.io
==========

Microservice framework based on Seneca microservice framework for bootstrapping your application code

### Provides

* Sensors for metrics collectors via http
* Propagates flow/request context across the call chain for tracking/logging
* Health check for itself via http
* Guard against uncaught errors, logging and shutdown cycle
* Stats API accessible via seneca-mesh network
* Too busy handler that limits incoming requests

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
