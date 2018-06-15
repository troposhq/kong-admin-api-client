const Resource = require('./resource');

function Services(opts) {
  if (!(this instanceof Services)) { return new Services(opts); }
  Resource.call(this, opts);
}

Services.prototype = Object.create(Resource.prototype);
Services.prototype.constructor = Services;

/**
 * Gets a service either by it's name/id or gets a service associated with a route id.
 *
 * @param {Object} params
 * @param {String} [params.nameOrId] A service's name or id. Semi-optional. One of nameOrId or routeId must be specified.
 * @param {String} [params.routeId] A route id. Will get the service associated with the route. Semi-optional. One of nameOrId or routeId must be specified.
 */

Services.prototype.get = function get({ nameOrID, routeID }) {
  if (nameOrID) {
    return this.request({
      method: 'GET',
      url: `/services/${nameOrID}`,
    });
  }

  return this.request({
    method: 'GET',
    url: `/routes/${routeID}/service`,
  });
};

module.exports = Services;
