import { Resource } from '@opentelemetry/resources';

/* Takes an array of resources and merges into one mega-resource */
export function mergeResources(
  resources: Array<Resource | null | undefined>,
): Resource {
  let mergedResources = resources[0] || new Resource({});

  for (let i = 1; i < resources.length; i++) {
    const resource = resources[i] || null;
    mergedResources = mergedResources.merge(resource);
  }

  return mergedResources;
}
