import { Resource, ResourceAttributes } from '@opentelemetry/resources';

/* Takes an array of resources and merges into one mega-resource */
export function mergeResources(
  resources: Array<Resource | null | undefined | ResourceAttributes>,
): Resource {
  let mergedResources = validateResource(resources[0]);

  for (let i = 1; i < resources.length; i++) {
    if (!resources[i]) {
      continue;
    }
    const resource = validateResource(resources[i]);
    mergedResources = mergedResources.merge(resource);
  }

  return mergedResources;
}

function validateResource(
  resource: Resource | ResourceAttributes | null | undefined,
) {
  if (resource instanceof Resource) {
    return resource;
  }

  if (resource) {
    return new Resource(resource);
  }

  return new Resource({});
}
