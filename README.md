# kong-admin-api-client
Library to interact with the Kong Admin API.

# Usage

```javascript
const Client = require('../src/client');

// Create a new client
const adminAPIURL = 'http://localhost:8001';
const client = new Client({
  adminAPIURL,
});

const result = await client.createConsumer({
  username: 'alois@troposhq.com',
  customId: '1',
});
```
