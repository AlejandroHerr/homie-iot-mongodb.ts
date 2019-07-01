import { appContainerFactory } from './libs/AppContainer';
import ConfigProvider from './providers/ConfigProvider';
import DeviceCollectionProvider from './providers/DeviceCollectionProvider';
import DeviceFactoryProvider from './providers/DeviceFactoryProvider';
import LoggerProvider from './providers/LoggerProvider';
import MongoDbClientServiceProvider from './providers/MongoDbClientProvider';
import MQTTClientProvider from './providers/MQTTClientProvider';
import MQTTPatternFactoryProvider from './providers/MQTTPatternFactoryProvider';
import MQTTTopicRouterProvider from './providers/MQTTTopicRouterProvider';
import NodeCollectionProvider from './providers/NodeCollectionProvider';
import NodeFactoryProvider from './providers/NodeFactoryProvider';
import PropertyCollectionProvider from './providers/PropertyCollectionProvider';
import PropertyFactoryProvider from './providers/PropertyFactoryProvider';

appContainerFactory()
  .register(
    ConfigProvider,
    LoggerProvider,
    MQTTPatternFactoryProvider,
    MQTTTopicRouterProvider,
    MQTTClientProvider,
    DeviceFactoryProvider,
    NodeFactoryProvider,
    PropertyFactoryProvider,
    MongoDbClientServiceProvider,
    DeviceCollectionProvider,
    NodeCollectionProvider,
    PropertyCollectionProvider,
  )
  .boot()
  .catch(error => {
    console.error(error);
  });
