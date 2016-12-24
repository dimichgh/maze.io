maze.io
==========

Microservice framework microservice framework for bootstrapping your application code into the world of microservices.

### Provides

* Bootstrapping of the application into microservice environment
* Sensors for metrics collectors via http
* Propagates flow/request context across the call chain for tracking/logging
* Tracing of the requests
* Components health checks
* Guard against uncaught errors, logging and shutdown cycle
* Stats API accessible via http/seneca-mesh network
* Too busy logic to manage incoming traffic

### Usage

TBD

### Architecture

The system is based on mesh network architecture that allows to forms virtual networks that do provide service discovering and automatic management of services that need to join/disconnect/went dead.

The mesh network of all members acts as a virtual entity that provides:
* state of each service/component
* configuration of each service/component

Each network component/service has its own attributes/pins/tags that can be used to identify the type of the component as well as its purpose.

The below features/components should be injected by auto-pilot bootstrap code without affecting the regular application unless it is done via configuration or adding new functionality as a separate network aware components.

#### Exposing mesh network states

It can be done using a dedicated microservice that asks all members to provide the state and exposes it via http/healthcheck/configuration. So the state can be queried, monitored and changed.

The UI components can use the above special service to provide visual view into the network that can be customized to see the whole network or zoom in into the box, for example, based on attributes of the services that define the dimension.

##### Metrics

TBD

###### Custom metrics

TBD

##### Health-checks

Health-checks of each component can be grouped into group states that can be used for example to monitor critical components as a single entity.

#### Managing traffic

To provide the same level of control that modern load balancer provide to the OPS the network should provide services that would allow to group components into virtual groups based on metadata attributes

#### Caching/sharing

Since mesh network represents the whole system, it can act as distributes cache in addition to main purpose as long as they all provide a specific API to store/retrieve the values.

#### configuration

TBD

#### Security

The network should provide security feature to control who can join the netowork.
Once the member joins the network it has access to other members/services based on scope.
The authentication should happen once, though there should be tools to kick the member out after specific timeout if it does not update its security credentials like security token.

#### Load balancing and back pressure management

The client load balancing relies on seneca balance client.

In contrast to the existing load balancing methods for the services, the network can provide the feature where the services can be made smarter and based on how busy they are they may regulate the incoming traffic by disconnecting from the mesh network till they finish with a backlog of tasks and then re-joining the network afterwards.

#### Service discovery, network seeding

* The mesh network allows each member to be an entry point to join the network.
Given that to guarantee stability/integrity of the whole system each member can expose fixed port to link to static LB with static cname to use for auto-discovery by new members.
* If there are dedicated boxes used as a bases, they still need to use LB to re-discover the network in case all bases went down.
* Or the base should be smarter to preserve the targets to connect to when it restarts to avoid some member staying in their own segment after all the bases are restarted.

#### Service invocation

To handle back pressure the client handlers should provide circuit breaker with automatic recovery similar to histrix.

Service should propagate context to other services to maintain main request context to be able to provide full trace for the transaction.

#### Tracing

The network components should propagate the main request context via correlation ids and publish it to log aggregation endpoints as part of each log event that would form the aggregated trace view for the main request.

#### Logging

The simplest way is to channel all the logs into the aggregation endpoint

#### Monitoring

* Log analysis with automatic alerts for specific events at aggregation level
* Health check monitoring and visual view (CPU, memory, toobusy)
* Email notifications for critical errors/uncaught exceptions/oom/restarts
* Automatic action for the specific errors, like restarts or notifications

#### Metrics reporting

* Process stats
* Service metrics
* Custom metrics

### Advanced

TBD

#### TODO:
* grpc transport
* toobusy with monitoring window to provide better measure of business of the component
* circuit breaker handler
