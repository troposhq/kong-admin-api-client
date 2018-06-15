const Services = require('./services');
const Routes = require('./routes');
const Consumers = require('./consumers');

/**
 *
 * @param {Object} opts
 * @param {String} opts.adminAPIURL URL to the Kong Admin API
 */

function Kong(opts = {}) {
  if (!(this instanceof Kong)) { return new Kong(opts); }

  const { adminAPIURL = 'http://localhost:8001' } = opts;

  this.services = new Services({ adminAPIURL, resourceURL: '/services' });
  this.routes = new Routes({ adminAPIURL, resourceURL: '/routes' });
  this.consumers = new Consumers({ adminAPIURL, resourceURL: '/consumers' });
}

module.exports = Kong;
