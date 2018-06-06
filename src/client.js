const axios = require('axios');
const errors = require('./errors');

// removed all keys from an object that are undefined, null, or ''
function omitEmpty(obj) {
  return Object.keys(obj).reduce((p, c) => {
    const r = { ...p };
    if (obj[c] !== undefined && obj[c] !== null && obj[c] !== '') {
      r[c] = obj[c];
    }

    return r;
  }, {});
}

/**
 *
 * @param {Object} opts
 * @param {String} opts.adminAPIURL URL to the Kong Admin API
 */

function Kong(opts) {
  if (!(this instanceof Kong)) { return new Kong(); }

  this.adminAPIURL = opts.adminAPIURL || 'http://localhost:8001';
}

/**
 *
 * @returns {Promise}
 */

Kong.prototype.request = function request(c) {
  const config = { ...c, baseURL: this.adminAPIURL };
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

// Services

Kong.prototype.addService = function addService({ /* eslint-disable camelcase */
  name,
  protocol,
  host,
  port,
  path,
  retries,
  connect_timeout, // milliseconds
  write_timeout, // milliseconds,
  read_timeout, // milliseconds,
  url,
}) {
  return this.request({
    method: 'POST',
    url: '/services',
    headers: {
      'Content-Type': 'application/json',
    },
    data: omitEmpty({
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
    }),
  });
};

/**
 * Gets a service either by it's name/id or gets a service associated with a route id.
 *
 * @param {Object} params
 * @param {String} [params.nameOrId] A service's name or id. Semi-optional. One of nameOrId or routeId must be specified.
 * @param {String} [params.routeId] A route id. Will get the service associated with the route. Semi-optional. One of nameOrId or routeId must be specified.
 */

Kong.prototype.getService = function getService({ nameOrId, routeId }) {
  if (nameOrId) {
    return this.request({
      method: 'GET',
      url: `/services/${nameOrId}`,
    });
  }

  return this.request({
    method: 'GET',
    url: `/routes/${routeId}/service`,
  });
};

Kong.prototype.listServices = function listServices({ offset, size } = {}) {
  return this.request({
    method: 'GET',
    url: '/services',
    params: omitEmpty({
      size,
      offset,
    }),
  });
};

Kong.prototype.updateService = function updateService(serviceId, { /* eslint-disable camelcase */
  name,
  protocol,
  host,
  port,
  path,
  retries,
  connect_timeout, // milliseconds
  write_timeout, // milliseconds,
  read_timeout, // milliseconds,
  url,
}) {
  return this.request({
    method: 'PATCH',
    url: `/services/${serviceId}`,
    data: omitEmpty({
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
    }),
  });
};

Kong.prototype.deleteService = function deleteService(nameOrId) {
  return this.request({
    method: 'DELETE',
    url: `/services/${nameOrId}`,
  });
};

// Routes

Kong.prototype.addRoute = function addRoute({ /* eslint-disable camelcase */
  protocols,
  methods,
  hosts,
  paths,
  strip_path,
  preserve_host,
  serviceId,
}) {
  return this.request({
    method: 'POST',
    url: '/routes',
    headers: {
      'Content-Type': 'application/json',
    },
    data: omitEmpty({
      protocols,
      methods,
      hosts,
      paths,
      strip_path,
      preserve_host,
      service: {
        id: serviceId,
      },
    }),
  });
};

Kong.prototype.getRoute = function getRoute(id) {
  return this.request({
    method: 'GET',
    url: `/routes/${id}`,
  });
};

Kong.prototype.listRoutes = function listRoutes({ serviceNameOrID, offset, size } = {}) {
  if (serviceNameOrID) {
    return this.request({
      method: 'GET',
      url: `/services/${serviceNameOrID}/routes`,
      params: omitEmpty({
        size,
        offset,
      }),
    });
  }

  return this.request({
    method: 'GET',
    url: '/routes',
    params: omitEmpty({
      size,
      offset,
    }),
  });
};

Kong.prototype.updateRoute = function updateRoute(id, { /* eslint-disable camelcase */
  protocols,
  methods,
  hosts,
  paths,
  strip_path,
  preserve_host,
  serviceId,
}) {
  const b = omitEmpty({
    protocols,
    methods,
    hosts,
    paths,
    strip_path,
    preserve_host,
  });

  if (serviceId) {
    b.service = {
      id: serviceId,
    };
  }

  return this.request({
    method: 'PATCH',
    url: `/routes/${id}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: b,
  });
};

Kong.prototype.deleteRoute = function deleteRoute(id) {
  return this.request({
    method: 'DELETE',
    url: `/routes/${id}`,
  });
};

// Consumers

/**
 *
 * @param {Object} params
 * @param {String} params.username Kong Consumer username
 * @param {String} params.customId Kong Consumer custom id
 */

Kong.prototype.createConsumer = function createConsumer({ username, customId }) {
  return this.request({
    method: 'POST',
    url: '/consumers',
    data: omitEmpty({
      custom_id: customId,
      username,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

Kong.prototype.getConsumer = function getConsumer(usernameOrId) {
  return this.request({
    method: 'GET',
    url: `/consumers/${usernameOrId}`,
  });
};

Kong.prototype.listConsumers = function listConsumers({ offset, size } = {}) {
  return this.request({
    method: 'GET',
    url: '/consumers',
    params: omitEmpty({
      size,
      offset,
    }),
  });
};

Kong.prototype.updateConsumer = function updateConsumer(usernameOrId, { username, custom_id }) {
  return this.request({
    method: 'PATCH',
    url: `/consumers/${usernameOrId}`,
    data: omitEmpty({
      username,
      custom_id,
    }),
  });
};

Kong.prototype.deleteConsumer = function deleteConsumer(usernameOrId) {
  return this.request({
    method: 'DELETE',
    url: `/consumers/${usernameOrId}`,
  });
};

Kong.prototype.createJWTCredential = function createJWTCredential(consumerIDOrUsername) {
  return this.request({
    method: 'POST',
    url: `/consumers/${consumerIDOrUsername}/jwt`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

module.exports = Kong;
