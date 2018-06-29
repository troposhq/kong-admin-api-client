# Kong Admin API Node.js Library

The Kong Admin API Node library provides convenient access to the Kong Admin API from
applications written in server-side JavaScript.

## Installation

Install the package with:

    npm install @tropos/kong-admin-api-client --save

## Usage

The package needs to be configured with your Admin API's URL.

```javascript
const Kong = require('@tropos/kong-admin-api-client');

const adminAPIURL = 'http://localhost:8001';
// Create a new client with the default exported constructor
const kong = new Kong({ adminAPIURL });
```

The kong object has properties that correspond to all the Kong Admin API resources.
The currently supported resources are:

- Services
- Routes
- Consumers
- Credentials

```javascript
// use these objects to interface with the API
kong.services
kong.routes
kong.consumers
```

All of the resources have standard methods you can use to access the API:

- create
- get
- list
- update
- delete

```javascript
// use the resource properties to interface with the API
// all the resources have the standard API methods
kong.services.get();
kong.routes.list();
kong.consumers.delete();
```

## API

### Services
**#create**

Creates a new service

**Params**

<table><thead>
<tr>
<th style="text-align: right">Attributes</th>
<th>Description</th>
</tr>
</thead><tbody>
<tr>
<td style="text-align: right"><code>name</code> <br><em>optional</em></td>
<td>The Service name.</td>
</tr>
<tr>
<td style="text-align: right"><code>protocol</code></td>
<td>The protocol used to communicate with the upstream. It can be one of <code>http</code> (default) or <code>https</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>host</code></td>
<td>The host of the upstream server.</td>
</tr>
<tr>
<td style="text-align: right"><code>port</code></td>
<td>The upstream server port. Defaults to <code>80</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>path</code><br><em>optional</em></td>
<td>The path to be used in requests to the upstream server. Empty by default.</td>
</tr>
<tr>
<td style="text-align: right"><code>retries</code><br><em>optional</em></td>
<td>The number of retries to execute upon failure to proxy. The default is <code>5</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>connect_timeout</code><br><em>optional</em></td>
<td>The timeout in milliseconds for establishing a connection to the upstream server. Defaults to <code>60000</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>write_timeout</code><br><em>optional</em></td>
<td>The timeout in milliseconds between two successive write operations for transmitting a request to the upstream server. Defaults to <code>60000</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>read_timeout</code><br><em>optional</em></td>
<td>The timeout in milliseconds between two successive read operations for transmitting a request to the upstream server. Defaults to <code>60000</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>url</code><br><em>shorthand-attribute</em></td>
<td>Shorthand attribute to set <code>protocol</code>, <code>host</code>, <code>port</code> and <code>path</code> at once. This attribute is write-only (the Admin API never "returns" the url).</td>
</tr>
</tbody></table>

**Example**
```javascript
await kong.services.create({
  name: 'my_service',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
});
```

**Returns**

This method returns the direct response from the Kong Admin API server.
```json
{
    "id": "4e13f54a-bbf1-47a8-8777-255fed7116f2",
    "created_at": 1488869076800,
    "updated_at": 1488869076800,
    "connect_timeout": 60000,
    "protocol": "http",
    "host": "example.org",
    "port": 80,
    "path": "/api",
    "name": "example-service",
    "retries": 5,
    "read_timeout": 60000,
    "write_timeout": 60000
}
```