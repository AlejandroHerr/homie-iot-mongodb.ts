import { TopicRouteHandler } from './types';

export default interface MQTTRouter {
  readonly routedTopics: string[];

  addTopicRoute(topic: string, handler: TopicRouteHandler): Promise<this>;
  removeTopicRoute(topic: string): Promise<this>;
  removeAllTopicRoutes(): Promise<this>;
  hasTopicRoute(topic: string): boolean;
}
