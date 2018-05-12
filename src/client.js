const axios = require('axios');
const errors = require('./errors');

function Kong(opts) {
  if (!(this instanceof Kong)) { return new Kong(); }

  this.adminAPIURL = opts.adminAPIURL || 'http://localhost:8001';
}

/**
 *
 * @returns {Promise}
 */

Kong.prototype.request = function request(config) {
  return axios(config)
    .then(x => x.data)
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new errors.ServerError(error);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        throw new errors.NoResponseError(error);
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new errors.RequestError(error);
      }
    });
};

//
// Consumer Object
//

Kong.prototype.createConsumer = function createConsumer({ username, customId }) {
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/consumers`,
    data: {
      custom_id: `${customId}`,
      username: `${username}`,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

Kong.prototype.getConsumer = function getConsumer(usernameOrId) {
  return this.request({
    method: 'GET',
    url: `${this.adminAPIURL}/consumers/${usernameOrId}`,
  });
};

Kong.prototype.deleteConsumer = function deleteConsumer(usernameOrId) {
  return this.request({
    method: 'DELETE',
    url: `${this.adminAPIURL}/consumers/${usernameOrId}`,
  });
};

Kong.prototype.createJWTCredential = function createJWTCredential(consumerIDOrUsername) {
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/consumers/${consumerIDOrUsername}/jwt`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

//
// Service Object
//

Kong.prototype.createService = function createService({ /* eslint-disable camelcase */
  name,
  protocol,
  host,
  port,
  path,
  retries = 5,
  connect_timeout = 60000, // milliseconds
  write_timeout = 60000, // milliseconds,
  read_timeout = 60000, // milliseconds,
  url,
}) {
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/services`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
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
    },
  });
};

Kong.prototype.getService = function getService({ nameOrId, routeId }) {
  if (nameOrId) {
    return this.request({
      method: 'GET',
      url: `${this.adminAPIURL}/services/${nameOrId}`,
    });
  }

  return this.request({
    method: 'GET',
    url: `${this.adminAPIURL}/routes/${routeId}/service`,
  });
};

Kong.prototype.deleteService = function deleteService(nameOrId) {
  return this.request({
    method: 'DELETE',
    url: `${this.adminAPIURL}/services/${nameOrId}`,
  });
};

//
// Route Object
//

Kong.prototype.addRoute = function addRoute({ /* eslint-disable camelcase */
  protocols,
  methods,
  hosts,
  paths,
  strip_path,
  preserve_host,
  service,
}) {
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/routes`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      protocols,
      methods,
      hosts,
      paths,
      strip_path,
      preserve_host,
      service,
    },
  });
};

module.exports = Kong;
