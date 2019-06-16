import defaultNodeAttributes from './defaultNodeAttributes';
import Node, { NodeUniqueFields } from './Node';

describe('Node', () => {
  it('should create an Node with default values', () => {
    const props = {
      deviceId: 'testDeviceId',
      id: 'testId',
    };
    const node = new Node(props);

    expect(node.deviceId).toBe(props.deviceId);
    expect(node.id).toBe(props.id);
    expect(node.attributes).toEqual(defaultNodeAttributes);
  });

  it('should create an Node with provided values', () => {
    const props = {
      deviceId: 'testDeviceId',
      id: 'testId',
      attributes: {
        name: 'Test Node',
      },
    };
    const node = new Node(props);

    expect(node.deviceId).toBe(props.deviceId);
    expect(node.id).toBe(props.id);
    expect(node.attributes).toEqual({
      ...defaultNodeAttributes,
      ...props.attributes,
    });
  });

  it('.getUniqueFields should return nodeUniqueFields', () => {
    const props = {
      deviceId: 'testDeviceId',
      id: 'testId',
    };
    const node = new Node(props);

    const nodeUniqueFields: NodeUniqueFields = node.getUniqueFields();

    expect(nodeUniqueFields).toEqual({ deviceId: 'testDeviceId', id: 'testId' });
  });
});
