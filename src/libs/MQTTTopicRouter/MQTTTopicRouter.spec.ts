import { AsyncClient } from 'async-mqtt';
import Application from '../../Application';
import ConfigProvider from '../../providers/ConfigProvider';
import LoggerProvider from '../../providers/LoggerProvider';
import MQTTClientProvider from '../../providers/MQTTClientProvider';
import MQTTTopicRouter from './MQTTTopicRouter';
import mqttPattern from '../mqttPattern';

const BASE_TOPIC = '/libs/MQTTTopicRouter';

const waitForMQTTMessage = async (mqttClient: AsyncClient) => {
  await mqttClient.subscribe('#');
  return new Promise(resolve =>
    mqttClient.once('message', async () => {
      await mqttClient.unsubscribe('#');

      resolve();
    }),
  );
};

const publishAndWaitForMessage = async (mqttClient: AsyncClient, topic: string, value: string) => {
  const waitForMQTTMessagePromise = waitForMQTTMessage(mqttClient);

  await mqttClient.publish(topic, value);

  return waitForMQTTMessagePromise;
};

const app = Application.createApplication();

const setup = () => {
  const mqttTopicRouter = new MQTTTopicRouter(app.container.cradle);

  return {
    mqttTopicRouter,
    mqttClient: app.container.resolve<AsyncClient>('mqttClient'),
  };
};

describe('libs/MQTTTopicRouter', () => {
  beforeAll(async () => {
    await app.register(ConfigProvider, LoggerProvider, MQTTClientProvider).boot();
  });
  afterAll(async () => {
    await app.dispose();
  });

  it('.subscribe should subscribe the router to handle the messages', async () => {
    const { mqttTopicRouter, mqttClient } = setup();

    const topicRoute = {
      topic: `${BASE_TOPIC}/subscribe`,
      handler: jest.fn(),
    };
    await mqttTopicRouter.addTopicRoute(topicRoute.topic, topicRoute.handler);

    await publishAndWaitForMessage(mqttClient, topicRoute.topic, 'testValue');

    expect(mqttTopicRouter.isSubscribed).toBeFalsy();
    expect(topicRoute.handler).not.toHaveBeenCalled();

    mqttTopicRouter.subscribe();

    await publishAndWaitForMessage(mqttClient, topicRoute.topic, 'testValue');

    expect(mqttTopicRouter.isSubscribed).toBeTruthy();
    expect(topicRoute.handler).toHaveBeenCalledTimes(1);
  });

  it('.subscribe should subscribe the router only once', async () => {
    const { mqttTopicRouter, mqttClient } = setup();

    mqttTopicRouter.subscribe().subscribe();

    const topicRoute = {
      topic: `${BASE_TOPIC}/subscribe`,
      handler: jest.fn(),
    };
    await mqttTopicRouter.addTopicRoute(topicRoute.topic, topicRoute.handler);

    await publishAndWaitForMessage(mqttClient, topicRoute.topic, 'testValue');

    expect(mqttTopicRouter.isSubscribed).toBeTruthy();
    expect(topicRoute.handler).toHaveBeenCalledTimes(1);
  });

  it('.addTopicRoute should add topics to be routes', async () => {
    const { mqttTopicRouter, mqttClient } = setup();

    mqttTopicRouter.subscribe();

    const topicRoute0 = {
      topic: `${BASE_TOPIC}/addTopicRoute/0/+name/#args`,
      handler: jest.fn(),
    };
    const topicRoute1 = {
      topic: `${BASE_TOPIC}/addTopicRoute/1/+name/#args`,
      handler: jest.fn(),
    };

    await Promise.all([
      mqttTopicRouter.addTopicRoute(topicRoute0.topic, topicRoute0.handler),
      mqttTopicRouter.addTopicRoute(topicRoute1.topic, topicRoute1.handler),
    ]);

    const params = {
      name: 'testName',
      args: ['arg0', 'arg1'],
    };

    await publishAndWaitForMessage(mqttClient, mqttPattern.fill(topicRoute0.topic, params), 'testValue');

    expect(topicRoute0.handler).toHaveBeenCalledTimes(1);

    const [[args]] = topicRoute0.handler.mock.calls;

    expect(args.payload.toString()).toBe('testValue');
    expect(args.topicPattern).toBe(topicRoute0.topic);
    expect(args.match).toEqual(params);

    expect(topicRoute1.handler).not.toHaveBeenCalled();
  });
  it('.removeTopicRoute should remeove the listener for the route', async () => {
    const { mqttTopicRouter, mqttClient } = setup();

    mqttTopicRouter.subscribe();

    const topicRoute = {
      topic: `${BASE_TOPIC}/removeTopicRoute`,
      handler: jest.fn(),
    };

    await mqttTopicRouter.addTopicRoute(topicRoute.topic, topicRoute.handler);
    await mqttTopicRouter.removeTopicRoute(topicRoute.topic);

    await publishAndWaitForMessage(mqttClient, topicRoute.topic, 'testValue');

    expect(topicRoute.handler).not.toHaveBeenCalled();
  });

  it('.removeAllTopicRoutes should remeove the listener for the route', async () => {
    const { mqttTopicRouter, mqttClient } = setup();

    mqttTopicRouter.subscribe();

    const topicRoutes = [
      {
        topic: `${BASE_TOPIC}/removeAllTopicRoutes/0`,
        handler: jest.fn(),
      },
      {
        topic: `${BASE_TOPIC}/removeAllTopicRoutes/1`,
        handler: jest.fn(),
      },
    ];

    await Promise.all([
      mqttTopicRouter.addTopicRoute(topicRoutes[0].topic, topicRoutes[0].handler),
      mqttTopicRouter.addTopicRoute(topicRoutes[1].topic, topicRoutes[1].handler),
    ]);

    await mqttTopicRouter.removeAllTopicRoutes();

    await publishAndWaitForMessage(mqttClient, topicRoutes[0].topic, 'testValue');
    await publishAndWaitForMessage(mqttClient, topicRoutes[1].topic, 'testValue');

    expect(topicRoutes[0].handler).not.toHaveBeenCalled();
    expect(topicRoutes[1].handler).not.toHaveBeenCalled();
  });

  it('.hasTopic should return true if topic is routed', async () => {
    const { mqttTopicRouter } = setup();

    const topicRoute = {
      topic: `${BASE_TOPIC}/subscribe`,
      handler: jest.fn(),
    };

    expect(mqttTopicRouter.hasTopicRoute(topicRoute.topic)).toBeFalsy();

    await mqttTopicRouter.addTopicRoute(topicRoute.topic, topicRoute.handler);

    expect(mqttTopicRouter.hasTopicRoute(topicRoute.topic)).toBeTruthy();
  });
});
