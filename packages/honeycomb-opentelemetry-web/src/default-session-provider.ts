import { RandomIdGenerator } from '@opentelemetry/sdk-trace-base';

const generator = new RandomIdGenerator();
const sessionId = generator.generateTraceId();

export const defaultSessionProvider = {
  getSessionId: () => sessionId,
};
