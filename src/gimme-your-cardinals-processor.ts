// general idea
// make it possible for end user to provide an array/object whatever
// that contains the keys they want to get dynamically pulled in...
// or actually even better, a function we can call to do a lookup to get that key
// e.g. ask sentry/fullstory etc for the id, check the cookie, etc
// instantiate this processor
// make that available to the rest of the application, properties or whatever
// so whenever you can get a thing, e.g. fullstory id, amplitude id, user id, etc
// then that gets used in this processor onstart so it's on every span
// it's not quite as stable as a resource attribute but resource attributes are immutable
// only thing we can think of is potentially overwriting another attribute
// so... make sure we namespace our stuff?
// this is very wip ... let's make the callbacks function a map not an array

import { Span, SpanProcessor } from '@opentelemetry/sdk-trace-base';

type CardinalCallback = () => Array<string>;

const coolIdBro: CardinalCallback = () => {
  return ['id', 'heygirl'];
};

export class GimmeYourCardinalsProcessor implements SpanProcessor {
  private _cardinalCallbacks: Array<CardinalCallback>;

  constructor() {
    this._cardinalCallbacks = [];
  }

  registerCallback(callback: () => Array<string>) {
    this._cardinalCallbacks.push(callback);
  }
  onStart(span: Span): void {
    this._cardinalCallbacks.forEach((cb) => {
      // result of each function goes into the attributes
      const attr = cb();
      span.setAttribute(attr[0], attr[1]);
    });
  }

  onEnd() {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}

const cardProcessor = new GimmeYourCardinalsProcessor();
cardProcessor.registerCallback(coolIdBro);
