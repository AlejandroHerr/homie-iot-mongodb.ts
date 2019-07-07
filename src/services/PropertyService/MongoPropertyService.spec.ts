import { Collection } from 'mongodb';

import Property from '../../models/Property';
import ConfigProvider from '../../providers/ConfigProvider';
import LoggerProvider from '../../providers/LoggerProvider';
import MongoDbClientServiceProvider from '../../providers/MongoDbClientProvider';
import PropertyCollectionProvider from '../../providers/PropertyCollectionProvider';
import PropertyFactoryProvider from '../../providers/PropertyFactoryProvider';
import createAppContainerStore from '../../utils/createAppContainerStore';

import MongoPropertyService from './MongoPropertyService';

const appContainerStore = createAppContainerStore();

const setup = () => {
  const appContainer = appContainerStore.getAppContainer();

  const propertyService = appContainer.build(MongoPropertyService);

  return {
    mongoPropertyCollection: appContainer.resolve<Collection>('mongoPropertyCollection'),
    propertyService,
  };
};

describe('services/PropertyService/MongoPropertyService', () => {
  beforeAll(async () => {
    await appContainerStore
      .getAppContainer()
      .register(
        ConfigProvider,
        LoggerProvider,
        MongoDbClientServiceProvider,
        PropertyCollectionProvider,
        PropertyFactoryProvider,
      )
      .boot();
  });

  afterAll(async () => {
    const appContainer = appContainerStore.getAppContainer();
    const mongoPropertyCollection = appContainer.resolve<Collection>('mongoPropertyCollection');

    await mongoPropertyCollection.drop();

    await appContainer.dispose();
  });

  describe('findOneById', () => {
    it('should find by id and return a Property', async () => {
      const { mongoPropertyCollection, propertyService } = setup();

      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'id' };

      await mongoPropertyCollection.insertOne(idFields);

      const foundProperty = await propertyService.findOneById(idFields);

      expect(foundProperty).toBeInstanceOf(Property);
      expect((foundProperty as Property).deviceId).toBe(idFields.deviceId);
      expect((foundProperty as Property).id).toBe(idFields.id);
    });

    it('should return null if none found', async () => {
      const { propertyService } = setup();

      const foundProperty = await propertyService.findOneById({
        deviceId: 'deviceFakeId',
        nodeId: 'nodeFakeId',
        id: 'fakeId',
      });

      expect(foundProperty).toBeNull();
    });
  });

  describe('.createOneById', () => {
    it('should create a new document for the property', async () => {
      const { mongoPropertyCollection, propertyService } = setup();
      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'propertyId' };

      await propertyService.createOneById(idFields);

      const foundProperty = await mongoPropertyCollection.findOne(idFields);

      expect(foundProperty).not.toBeNull();
      expect(foundProperty.deviceId).toBe(idFields.deviceId);
      expect(foundProperty.id).toBe(idFields.id);
    });

    it('should not create a duplicate document for the property', async () => {
      const { mongoPropertyCollection, propertyService } = setup();
      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'propertyId' };

      await propertyService.createOneById(idFields);

      const foundProperties = await mongoPropertyCollection.find({ id: idFields.id }).toArray();

      expect(foundProperties).toHaveLength(1);
      expect(foundProperties[0]).not.toBeNull();
      expect(foundProperties[0].deviceId).toBe(idFields.deviceId);
      expect(foundProperties[0].id).toBe(idFields.id);
    });
  });

  describe('.updateAttributeById', () => {
    it('should update an attribute in an existing document', async () => {
      const { mongoPropertyCollection, propertyService } = setup();

      const idFields = { deviceId: 'deviceId', nodeId: 'nodeId', id: 'propertyId' };

      const [attribute, value] = ['name', 'new name'];

      await propertyService.updateAttributeById(idFields, `$${attribute}`, value);

      await expect(
        mongoPropertyCollection.findOne(idFields).then(({ attributes }) => attributes),
      ).resolves.toHaveProperty(attribute, value);
    });

    it('should throw an error if document does not exist', async () => {
      const { propertyService } = setup();

      const idFields = { deviceId: 'fakeId', nodeId: 'fakeId', id: 'fakeId' };

      const [attribute, value] = ['name', 'new name'];

      await expect(propertyService.updateAttributeById(idFields, `$${attribute}`, value)).rejects.toEqual(
        new Error(`Property with ${JSON.stringify(idFields)} not found`),
      );
    });
  });
});
