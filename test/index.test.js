const { assert } = require('chai');
const Kong = require('../src/kong');
const Resource = require('../src/resource');
const Services = require('../src/services');
const Routes = require('../src/routes');
const Consumers = require('../src/consumers');
const errors = require('../src/errors');

async function deleteAll() {
  const services = new Services({ adminAPIURL, resourceURL: '/services' });
  const routes = new Routes({ adminAPIURL, resourceURL: '/routes' });
  const consumers = new Consumers({ adminAPIURL, resourceURL: '/consumers' });

  await deleteAllResources(consumers);
  await deleteAllResources(routes);
  await deleteAllResources(services);
}

async function deleteAllResources(resource) {
  let next;
  do {
    const list = await resource.list();
    await Promise.all(list.data.map(async (r) => resource.del(r.id)));
    next = list.next;
  } while (next !== null);
}

const adminAPIURL = 'http://localhost:8001';

describe('Kong Admin API Client', () => {
  const resource = new Resource({ adminAPIURL, resourceURL: '/services' }); // use the services resourceURL to check functionality
  const services = new Services({ adminAPIURL, resourceURL: '/services' });
  const routes = new Routes({ adminAPIURL, resourceURL: '/routes' });
  const consumers = new Consumers({ adminAPIURL, resourceURL: '/consumers' });

  before(async () => {
    await deleteAll();
  });

  afterEach(async () => {
    await deleteAll();
  });

  describe('Resource', () => {
    const serviceData = {
      name: 'my_service',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
    };

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
        const service = await resource.create({ ...serviceData });
        assert.equal(serviceData.name, service.name);

        await resource.del(service.id);
      });
    });

    describe('#createOrUpdate', () => {
      it('should create resource if it does not exist and update it if it does exist', async () => {
        // create a service
        const service = await resource.createOrUpdate(serviceData.name, { ...serviceData });
        assert.equal(serviceData.name, service.name);

        // update the service
        const updated = await resource.createOrUpdate(serviceData.name, { ...serviceData, url: 'https://jsonplaceholder.typicode.com/posts/2' });
        assert.equal('/posts/2', updated.path);

        await resource.del(service.id);
      });
    });

    describe('#get', () => {
      it('should get route by id', async () => {
        const service = await resource.create({ ...serviceData });
        const result = await resource.get(service.id);
        assert.deepEqual(service, result);

        await resource.del(service.id);
      });
    });

    describe('#list', () => {
      beforeEach(async () => {
        await resource.create({ ...serviceData });
        await resource.create({
          name: 'service1',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });
        await resource.create({
          name: 'service2',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
        });
      });

      it('should list resources', async () => {
        const result = await resource.list();
        assert.equal(result.data.length, 3);
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
        const service = await resource.create({ ...serviceData });
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
        const service = await resource.create({ ...serviceData });
        const result = await resource.delete(service.id);
        assert.equal(result, '');
      });
    });
  });

  describe('Services', () => {
    let service;
    const serviceData = {
      name: 'test_service',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
    };

    describe('#getService', () => {
      beforeEach(async () => {
        service = await services.create(serviceData);
      });

      it('should get service by name', async () => {
        const result = await services.get({ nameOrID: service.name });
        assert.equal(result.name, service.name);
        assert.equal(result.id, service.id);
      });

      it('should get service by id', async () => {
        const result = await services.get({ nameOrID: service.id });
        assert.equal(result.name, service.name);
        assert.equal(result.id, service.id);
      });

      it('should get service for route', async () => {
        const route = await routes.create({
          service: {
            id: service.id,
          },
          paths: ['/my-route'],
        });
        const result = await services.get({ routeID: route.id });
        assert.equal(result.name, service.name);
        assert.equal(result.id, service.id);
      });
    });
  });

  describe('Routes', () => {
    let service;
    let route;

    beforeEach(async () => {
      service = await services.create({
        url: 'http://localhost:8000',
      });
      route = await routes.create({
        service: {
          id: service.id,
        },
        paths: ['/my-route'],
      });

      // add some more routes
      for (let index = 0; index < 3; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await routes.create({
          service: { id: service.id },
          paths: ['/my-route'],
        });
      }
    });

    describe('#list', () => {
      it('should list routes', async () => {
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

      it.skip('should paginate routes by service', async () => {
        const result = await routes.list({ serviceNameOrID: service.id, size: 1 });
        console.log(result);

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

    beforeEach(async () => {
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

      describe('after #createCredential', () => {
        beforeEach(async () => {
          credential = await consumers.createCredential(consumer.id);
        });

        describe('#deleteCredential', () => {
          it('should delete a credential', async () => {
            await consumers.deleteCredential(consumer.id, credential.id);
          });
        });

        describe('#listCredentials', () => {
          it('should list jwt credentials', async () => {
            let i = 0;
            // create 10 more creds
            while (i < 10) {
              // eslint-disable-next-line no-await-in-loop
              await consumers.createCredential(consumer.id);
              i += 1;
            }
            const credentials = await consumers.listCredentials(consumer.id);
            assert.equal(credentials.data.length, 11);
          });
        });
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
