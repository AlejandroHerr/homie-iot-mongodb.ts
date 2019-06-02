import Application from './Application';
import MqttClientProvier from './providers/MqttClientProvider';
import MongoDbClientServiceProvider from './providers/MongoDbClientProvider';
import MongoDbCollectionsProvider from './providers/MongoDbCollectionsProvider';
import ConfigProvider from './providers/ConfigProvider';
import LoggerProvider from './providers/LoggerProvier';

Application.createApplication()
  .register(ConfigProvider, LoggerProvider, MongoDbClientServiceProvider, MongoDbCollectionsProvider, MqttClientProvier)
  .boot()
  .catch(error => {
    console.error(error);
  });
