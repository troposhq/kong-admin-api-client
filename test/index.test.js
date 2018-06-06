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

    describe('#deleteService', () => {
      it('should delete service', async () => {
        const result = await client.deleteService(serviceId);
        assert.equal(result, '');
      });
    });
  });
});
