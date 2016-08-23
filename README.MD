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

### Architecture

The system is based on mesh network architecture that allows to forms virtual networks that do provide service discovering and automatic management of services that need to join/disconnect/went dead.

The mesh network of all members acts as a virtual entity that provides:
* state of each service/component
* configuration of each service/component

Each network component/service has its own attributes/pins/tags that can be used to identify the type of the component as well as its purpose.

#### Exposing network states

It can be done using a dedicated microservice that asks all members to provide the state and exposes it via http/healthcheck/configuration. So the state can be queried, monitored and changed.

The UI components can use the above special service to provide visual view into the network that can be customized to see the whole network or zoom in into the box, for example, based on attributes of the services that define the dimension.

##### Metrics

TBD

###### Custom metrics

##### Health-checks

Health-checks of each component can be grouped into group states that can be used for example to monitor critical components as a single entity.

##### Managing traffic

To provide the same level of control that modern load balancer provide to the OPS the network should provide services that would allow to group components into virtual groups based on metadata attributes

#### Security

The network should provide security feature to control who can join the netowork.
Once the member joins the network it has access to other members/services based on scope.
The authentication should happen once, though there should be tools to kick the member out after specific timeout if it does not update its security credentials like security token.

#### Reverse load balancing

In contrast to existing load balancing methods for the services, the network can provide the feature where the services can be made smarter and based on how busy they are they may regulate the incoming traffic by disconnecting from the network till they finish with backlogs of tasks and then re-joining the network afterwards.

#### Tracing

The network components should propagate the main request context via correlation ids and publish it to logs aggregation endpoints that would form the aggregated trace view for the main request.

### Advanced

#### Seeding network
