import { asClass } from 'awilix';

import { Provider } from '../libs/Container';
import MQTTTopicRouter from '../libs/MQTTTopicRouter/MQTTTopicRouter';

const MQTTTopicRouterProvider: Provider<MQTTTopicRouter> = Object.freeze({
  name: 'mqttTopicRouter',
  resolver: asClass(MQTTTopicRouter),
});

export default MQTTTopicRouterProvider;
