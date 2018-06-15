const { assert } = require('chai');
const Kong = require('../src/kong');
const Resource = require('../src/resource');
const Services = require('../src/services');
const Routes = require('../src/routes');
const Consumers = require('../src/consumers');
const errors = require('../src/errors');

describe('Kong Admin API Client', () => {
  const adminAPIURL = 'http://localhost:8001';

  const resource = new Resource({ adminAPIURL, resourceURL: '/services' }); // use the services resourceURL to check functionality
  const services = new Services({ adminAPIURL, resourceURL: '/services' });
  const routes = new Routes({ adminAPIURL, resourceURL: '/routes' });
  const consumers = new Consumers({ adminAPIURL, resourceURL: '/consumers' });

  describe('Resource', () => {
    let service;

    describe('#request', () => {
      it('should successfully create a request', async () => {
        await resource.request({
          method: 'GET',
          url: adminAPIURL,
        });
      });

      it('should throw NoResponseError when request receives no response', async () => {
        try {
          await resource.request({
            method: 'GET',
            url: 'http://notfound.troposhq.com',
          });
          assert.fail('Should not get here.');
        } catch (err) {
          assert.isTrue(err instanceof errors.NoResponseError);
        }
      });

      it('should throw ServerError when receiving error from server', async () => {
        try {
          await resource.request({
            method: 'GET',
            url: `${adminAPIURL}/notfound`,
          });
          assert.fail('Should not get here.');
        } catch (err) {
          assert.equal(err.status, 404);
          assert.isTrue(err instanceof errors.ServerError);
        }
      });
    });

    describe('#create', () => {
      it('should create a resource', async () => {
        const result = await resource.create({
          name: 'my_service',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });
        assert.equal(result.name, 'my_service');
        service = result;
      });
    });

    describe('#get', () => {
      it('should get route by id', async () => {
        const result = await resource.get(service.id);
        assert.deepEqual(result, service);
      });
    });

    describe('#list', () => {
      it('should list resources', async () => {
        // check the previously added service is there
        const result = await resource.list();
        assert.equal(result.data.length, 1);

        // add some more services
        await resource.create({
          name: 'service1',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });

        await resource.create({
          name: 'service2',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });

        const newResult = await resource.list();
        assert.equal(newResult.data.length, 3);
      });

      it('should paginate resources', async () => {
        // there should be 3 total services, let's get 2 at a time
        // and try to paginate through them
        const result = await resource.list({ size: 2 });
        assert.equal(result.data.length, 2);

        const newResult = await resource.list({ offset: result.offset });
        assert.equal(newResult.data.length, 1);
      });
    });

    describe('#update', () => {
      it('should update resource', async () => {
        await resource.update(service.id, {
          name: 'updated_service',
        });

        // get the service to make sure it updated
        const result = await resource.get(service.id);

        assert.equal(result.name, 'updated_service');
        assert.equal(result.id, service.id);
      });
    });

    describe('#delete', () => {
      it('should delete resource', async () => {
        const result = await resource.delete(service.id);
        assert.equal(result, '');
      });
    });
  });

  describe('Services', () => {
    let serviceResponse;
    const service = {
      name: 'test_service',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
    };

    describe('#getService', () => {
      before(async () => {
        serviceResponse = await services.create(service);
      });

      it('should get service by name', async () => {
        const result = await services.get({ nameOrID: serviceResponse.name });
        assert.equal(result.name, serviceResponse.name);
        assert.equal(result.id, serviceResponse.id);
      });

      it('should get service by id', async () => {
        const result = await services.get({ nameOrID: serviceResponse.id });
        assert.equal(result.name, serviceResponse.name);
        assert.equal(result.id, serviceResponse.id);
      });

      it('should get service for route', async () => {
        const route = await routes.create({
          service: {
            id: serviceResponse.id,
          },
          paths: ['/my-route'],
        });
        const result = await services.get({ routeID: route.id });
        assert.equal(result.name, serviceResponse.name);
        assert.equal(result.id, serviceResponse.id);
      });
    });
  });

  describe('Routes', () => {
    let serviceId;

    before(async () => {
      const result = await services.create({
        name: 'serviceForRoute',
        url: 'http://localhost:8000',
      });

      serviceId = result.id;
    });

    describe('#list', () => {
      it('should list routes', async () => {
        // check the previously added route is there
        const result = await routes.list();
        assert.equal(result.data.length, 1);

        // add some more routes
        for (let index = 0; index < 3; index += 1) {
          // eslint-disable-next-line no-await-in-loop
          await routes.create({
            service: { id: serviceId },
            paths: ['/my-route'],
          });
        }

        const newResult = await routes.list();
        assert.equal(newResult.data.length, 4);
      });

      it('should paginate routes', async () => {
        // there should be 4 total routes, let's get 3 at a time
        // and try to paginate through them
        const result = await routes.list({ size: 3 });
        assert.equal(result.data.length, 3);

        const newResult = await routes.list({ offset: result.offset });
        assert.equal(newResult.data.length, 1);
      });

      it('should list routes by service', async () => {
        const service = await services.create({
          url: 'http://localhost:8001',
        });

        await routes.create({
          service: { id: service.id },
          paths: ['/my-route'],
        });

        const result = await routes.list({ serviceNameOrID: service.id });
        assert.equal(result.data.length, 1);
      });

      it('should paginate routes by service', async () => {
        const service = await services.create({
          url: 'http://localhost:8001',
        });

        await routes.create({
          service: { id: service.id },
          paths: ['/my-route'],
        });

        await routes.create({
          service: { id: service.id },
          paths: ['/my-route'],
        });

        const result = await routes.list({ serviceNameOrID: service.id, size: 1 });
        assert.equal(result.data.length, 1);

        const next = await routes.list({
          serviceNameOrID: service.id,
          size: 1,
          offset: result.offset,
        });
        assert.equal(next.data.length, 1);
        assert.equal(next.next, null);
      });
    });
  });

  describe('Consumers', () => {
    let consumer;
    let credential;
    const username = 'my_user';
    const customId = '1';

    before(async () => {
      consumer = await consumers.create({ username, custom_id: customId });
    });

    describe('#createCredential', () => {
      it('should create a basic-auth credential', async () => {
        credential = await consumers.createCredential(consumer.id, 'basic-auth', {
          username: 'Aladdin',
          password: 'OpenSesame',
        });
        assert.equal('Aladdin', credential.username);
      });

      it('should create a jwt credential', async () => {
        credential = await consumers.createCredential(consumer.id);
      });
    });
  });

  describe('Kong', () => {
    it('should initialize with correct properties', () => {
      const kong = new Kong({ adminAPIURL });
      assert.instanceOf(kong.services, Services);
      assert.instanceOf(kong.routes, Routes);
      assert.instanceOf(kong.consumers, Consumers);
    });
  });
});
