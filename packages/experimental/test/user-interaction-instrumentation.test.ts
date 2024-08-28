import { wrapEventPropagationCb } from '../src/user-interaction-instrumentation';

describe('wrapEventPropagationCb', () => {
  it('wraps the function', () => {
    const fakeEvent = {
      stopPropagation: jest.fn(),
      stopImmediatePropagation: jest.fn(),
    };
    const fakeSpan = {
      end: jest.fn(),
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
