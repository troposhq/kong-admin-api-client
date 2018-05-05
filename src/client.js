const axios = require('axios');

function Client(opts) {
  if (!(this instanceof Client)) { return new Client(); }

  this.adminAPIHost = opts.adminAPIHost || 'http://localhost';
  this.adminAPIPort = opts.adminAPIPort || '8001';
  this.kongAdminAPIURL = `${this.adminAPIHost}:${this.adminAPIPort}`;
}

Client.prototype.createConsumer = async function ({ username, customId }) {
  const consumerResult = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/consumers`,
    data: {
      custom_id: `${customId}`,
      username: `${username}`,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(x => x.data);

  return consumerResult;
}

Client.prototype.createJWTCredential = async function (consumerIDOrUsername) {
  const credential = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/consumers/${consumerIDOrUsername}/jwt`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(x => x.data);

  return credential;
}

Client.prototype.createService = async function ({
  name,
  protocol,
  host,
  port,
  path,
  retries,
  connect_timeout,
  write_timeout,
  read_timeout,
  url,
}) {
  const service = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/services`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(x => x.data);

  return service;
}

module.exports = Client;
