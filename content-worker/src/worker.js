import worker from './index.js';
import { applyContentPromptOverrides } from './prompt-overrides.js';

function withPromptOverrides(env) {
  if (!env?.AI?.run) return env;
  const ai = env.AI;
  return {
    ...env,
    AI: {
      run(model, input, ...rest) {
        const next = input && Array.isArray(input.messages)
          ? { ...input, messages: applyContentPromptOverrides(input.messages) }
          : input;
        return ai.run(model, next, ...rest);
      }
    }
  };
}

export default {
  fetch(request, env, ctx) {
    return worker.fetch(request, withPromptOverrides(env), ctx);
  },
  scheduled(controller, env, ctx) {
    return worker.scheduled(controller, withPromptOverrides(env), ctx);
  }
};
