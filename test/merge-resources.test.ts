import { Resource } from '@opentelemetry/resources';
import { mergeResources } from '../src/merge-resources';

describe('mergeResources', () => {
  test('merges all resources', () => {
    const resources = [
      new Resource({ hnyId: '12345' }),
      new Resource({ customAttribute: 'unique', customized: true, id: 5886 }),
    ];

    const result = mergeResources(resources);
    expect(result).toBeInstanceOf(Resource);

    const attributes = result.attributes;
    expect(attributes).toEqual({
      hnyId: '12345',
      customAttribute: 'unique',
      customized: true,
      id: 5886,
    });
  });

  test('creates new resources when passed an object', () => {
    const resources = [
      { supersize: true, flavor: 'sprite' },
      new Resource({ hnyId: '12345' }),
      new Resource({ customAttribute: 'unique', customized: true, id: 5886 }),
    ];

    const result = mergeResources(resources);
    expect(result).toBeInstanceOf(Resource);

    const attributes = result.attributes;
    expect(attributes).toEqual({
      supersize: true,
      flavor: 'sprite',
      hnyId: '12345',
      customAttribute: 'unique',
      customized: true,
      id: 5886,
    });
  });

  test('ignores undefined values', () => {
    const resources = [
      undefined,
      new Resource({ hnyId: '12345' }),
      new Resource({ customAttribute: 'unique', customized: true, id: 5886 }),
    ];

    const result = mergeResources(resources);
    expect(result).toBeInstanceOf(Resource);

    const attributes = result.attributes;
    expect(attributes).toEqual({
      hnyId: '12345',
      customAttribute: 'unique',
      customized: true,
      id: 5886,
    });
  });

  test('ignores null values', () => {
    const resources = [
      new Resource({ hnyId: '12345' }),
      null,
      new Resource({ customAttribute: 'unique', customized: true, id: 5886 }),
      null,
    ];

    const result = mergeResources(resources);
    expect(result).toBeInstanceOf(Resource);

    const attributes = result.attributes;
    expect(attributes).toEqual({
      hnyId: '12345',
      customAttribute: 'unique',
      customized: true,
      id: 5886,
    });
  });

  test('returns an empty resource when passed an empty array', () => {
    const result = mergeResources([]);
    expect(result).toBeInstanceOf(Resource);
    expect(result.attributes).toEqual({});
  });
});
