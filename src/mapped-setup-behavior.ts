import type { BehaviorEvent, BehaviorMap, EventObject, ReturnEventUnion } from './types';
import type { ActorContext, Behavior, TaggedState } from 'xactor/dist/types';
import { createSetupBehavior, isSignal } from 'xactor';
import { getMappedValue } from './util';
import { BehaviorEventMap, DefaultEventObjects } from './types';

// No explicit types
export function mappedSetupBehavior<Mapping extends BehaviorEvent<State>, State>(
  setup: (initialState: State, ctx: ActorContext<ReturnEventUnion<Mapping, State>>) => State | TaggedState<State>,
  mapping: Mapping,
  initial: State
): Behavior<ReturnEventUnion<Mapping, State>, State>;

// Explicit types
export function mappedSetupBehavior<Mapping extends EventObject, State, Strict extends true | false = false>(
  setup: (initialState: State, ctx: ActorContext<Mapping>) => State | TaggedState<State>,
  mapping: BehaviorEventMap<Mapping, State, Strict>,
  initial: State
): Behavior<Mapping, State>;

export function mappedSetupBehavior<Mapping extends EventObject | BehaviorEvent<State>, State>(
  setup: (initialState: State, ctx: ActorContext<ReturnEventUnion<Mapping, State>>) => State | TaggedState<State>,
  mapping: BehaviorMap<Mapping | DefaultEventObjects, State>,
  state: State
): Behavior<ReturnEventUnion<Mapping, State>, State> {
  return createSetupBehavior(
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
