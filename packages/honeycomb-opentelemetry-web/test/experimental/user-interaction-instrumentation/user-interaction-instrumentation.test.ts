import { vi } from 'vitest';
import { wrapEventPropagationCb } from '../../../src/experimental/user-interaction-instrumentation/user-interaction-instrumentation';

describe('wrapEventPropagationCb', () => {
  it('calls span.end on evt.stopPropagation', () => {
    const fakeEvent = {
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };
    const fakeSpan = {
      end: vi.fn(),
    };
    wrapEventPropagationCb(fakeEvent, 'stopPropagation', fakeSpan);

    // the one we wrapped doesn't call span.end
    fakeEvent.stopImmediatePropagation();
    expect(fakeSpan.end).toHaveBeenCalledTimes(0);

    // this one DOES, though
    fakeEvent.stopPropagation();
    expect(fakeSpan.end).toHaveBeenCalledTimes(1);
  });
});
