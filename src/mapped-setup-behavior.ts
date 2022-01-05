import type { BehaviorEvent, BehaviorMap, EventObject, ReturnEventUnion } from './types';
import type { ActorContext, TaggedState } from 'xactor/dist/types';
import { createSetupBehavior, isSignal } from 'xactor';
import { getMappedValue } from './util';
import { DefaultEventObjects } from './types';

export function mappedSetupBehavior<Mapping extends EventObject | BehaviorEvent<TState>, TState>(
  setup: (initialState: TState, ctx: ActorContext<ReturnEventUnion<Mapping, TState>>) => TState | TaggedState<TState>,
  mapping: BehaviorMap<Mapping | DefaultEventObjects, TState>,
  state: TState
) {
  return createSetupBehavior<ReturnEventUnion<Mapping, TState>, TState>(
    setup,
    (state, message, context) => {
      if (message.type in mapping) return getMappedValue(mapping, message, context, state, message.type);
      else if (isSignal(message)) return state;
      else if ('default' in mapping) return getMappedValue(mapping, message, context, state, 'default');
      else return state;
    },
    state
  );
}
