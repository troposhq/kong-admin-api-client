const { assert } = require('chai');
const Client = require('../src/client');
const errors = require('../src/errors');

describe('Kong Admin API Client', () => {
  const adminAPIURL = 'http://localhost:8001';
  const client = new Client({
    adminAPIURL,
  });

  describe('#request', () => {
    it('should successfully create a request', async () => {
      await client.request({
        method: 'GET',
        url: adminAPIURL,
      });
    });

    it('should throw NoResponseError when request receives no response', async () => {
      try {
        await client.request({
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
        await client.request({
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

  describe('services', () => {
    let serviceId;

    describe('#addService', () => {
      it('should add service', async () => {
        const result = await client.addService({
          name: 'my_service',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });
        assert.equal(result.name, 'my_service');

        serviceId = result.id;
      });
    });

    describe('#getService', () => {
      it('should get service by name', async () => {
        const result = await client.getService({
          nameOrId: 'my_service',
        });

        assert.equal(result.name, 'my_service');
        assert.equal(result.id, serviceId);
      });

      it('should get service by id', async () => {
        const result = await client.getService({
          nameOrId: serviceId,
        });

        assert.equal(result.name, 'my_service');
        assert.equal(result.id, serviceId);
      });
    });

    describe('#listServices', () => {
      it('should list services', async () => {
        // check the previously added service is there
        const result = await client.listServices();
        assert.equal(result.data.length, 1);

        // add some more services
        await client.addService({
          name: 'service1',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });

        await client.addService({
          name: 'service2',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });

        const newResult = await client.listServices();
        assert.equal(newResult.data.length, 3);
      });

      it('should paginate services', async () => {
        // there should be 3 total services, let's get 2 at a time
        // and try to paginate through them
        const result = await client.listServices({ size: 2 });
        assert.equal(result.data.length, 2);

        const newResult = await client.listServices({ offset: result.offset });
        assert.equal(newResult.data.length, 1);
      });
    });

    describe('#updateService', () => {
      it('should update service', async () => {
        await client.updateService(serviceId, {
          name: 'updated_service',
        });

        // get the service to make sure it updated
        const result = await client.getService({
          nameOrId: serviceId,
        });

        assert.equal(result.name, 'updated_service');
        assert.equal(result.id, serviceId);
      });
    });

    describe('#deleteService', () => {
      it('should delete service', async () => {
        const result = await client.deleteService(serviceId);
        assert.equal(result, '');
      });
    });
  });

  describe('routes', () => {
    let serviceId;
    let routeId;

    before(async () => {
      const result = await client.addService({
        name: 'serviceForRoute',
        url: 'http://localhost:8000',
      });

      serviceId = result.id;
    });

    describe('#addRoute', () => {
      it('should add route', async () => {
        const result = await client.addRoute({
          serviceId,
          paths: ['/my-route'],
        });

        assert.deepEqual(result.paths, ['/my-route']);
        routeId = result.id;
      });
    });

    describe('#getRoute', () => {
      it('should get route by id', async () => {
        const result = await client.getRoute(routeId);

        assert.deepEqual(result.paths, ['/my-route']);
        assert.equal(result.id, routeId);
        assert.equal(result.service.id, serviceId);
      });
    });

    describe('#listRoutes', () => {
      it('should list routes', async () => {
        // check the previously added route is there
        const result = await client.listRoutes();
        assert.equal(result.data.length, 1);

        // add some more routes
        for (let index = 0; index < 3; index += 1) {
          // eslint-disable-next-line no-await-in-loop
          await client.addRoute({
            serviceId,
            paths: ['/my-route'],
          });
        }

        const newResult = await client.listRoutes();
        assert.equal(newResult.data.length, 4);
      });

      it('should paginate routes', async () => {
        // there should be 4 total routes, let's get 3 at a time
        // and try to paginate through them
        const result = await client.listRoutes({ size: 3 });
        assert.equal(result.data.length, 3);

        const newResult = await client.listRoutes({ offset: result.offset });
        assert.equal(newResult.data.length, 1);
      });


      it('should list routes by service', async () => {
        const service = await client.addService({
          url: 'http://localhost:8001',
        });

        await client.addRoute({
          serviceId: service.id,
          paths: ['/my-route'],
        });

        const result = await client.listRoutes({ serviceNameOrID: service.id });
        assert.equal(result.data.length, 1);
      });

      it('should paginate routes by service', async () => {
        const service = await client.addService({
          url: 'http://localhost:8001',
        });

        await client.addRoute({
          serviceId: service.id,
          paths: ['/my-route'],
        });

        await client.addRoute({
          serviceId: service.id,
          paths: ['/my-route'],
        });

        const result = await client.listRoutes({ serviceNameOrID: service.id, size: 1 });
        assert.equal(result.data.length, 1);

        const next = await client.listRoutes({
          serviceNameOrID: service.id,
          size: 1,
          offset: result.offset,
        });
        assert.equal(next.data.length, 1);
        assert.equal(next.next, null);
      });
    });

    describe('#updateRoute', () => {
      it('should update route', async () => {
        await client.updateRoute(routeId, {
          paths: ['/my-new-route'],
        });

        // get the route to make sure it updated
        const result = await client.getRoute(routeId);

        assert.deepEqual(result.paths, ['/my-new-route']);
        assert.equal(result.service.id, serviceId);
      });

      it('should update route to use a nnew service', async () => {
        const service = await client.addService({
          name: 'new-service',
          url: 'http://localhost:8001',
        });

        await client.updateRoute(routeId, { serviceId: service.id });

        // get the route to make sure it updated
        const result = await client.getRoute(routeId);

        assert.deepEqual(result.service.id, service.id);
      });
    });

    describe('#deleteRoute', () => {
      it('should delete route', async () => {
        const result = await client.deleteRoute(routeId);
        assert.equal(result, '');

        try {
          await client.getRoute(routeId);
          assert.fail('Should not get here');
        } catch (err) {
          assert.equal(err.status, 404);
        }
      });
    });
  });

  describe('consumers', () => {
    const username = 'my_user';
    const customId = '1';

    describe('#createConsumer', () => {
      it('should create a consumer', async () => {
        const result = await client.createConsumer({
          username,
          customId,
        });

        assert.equal(result.custom_id, `${customId}`);
        assert.equal(result.username, username);
      });
    });

    describe('#getConsumer', () => {
      it('should get a consumer', async () => {
        const result = await client.getConsumer(username);
        assert.equal(result.custom_id, `${customId}`);
        assert.equal(result.username, username);
      });
    });

    describe('#deleteConsumer', () => {
      it('should delete a consumer', async () => {
        const result = await client.deleteConsumer(username);
        assert.equal(result, '');
      });
    });
  });
});
