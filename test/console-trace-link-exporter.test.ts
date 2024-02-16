import { buildTraceUrl } from '../src/console-trace-link-exporter';

const apikey = '000000000000000000000000';
const classicApikey = '00000000000000000000000000000000';

describe('buildTraceUrl', () => {
  it('builds environment trace URL', () => {
    const url = buildTraceUrl(
      apikey,
      'my-service',
      'my-team',
      'my-environment',
    );
    expect(url).toBe(
      'https://ui.honeycomb.io/my-team/environments/my-environment/datasets/my-service/trace?trace_id',
    );
  });

  it('builds classic trace URL', () => {
    const url = buildTraceUrl(
      classicApikey,
      'my-service',
      'my-team',
      'my-environment',
    );
    expect(url).toBe(
      'https://ui.honeycomb.io/my-team/datasets/my-service/trace?trace_id',
    );
  });
});
