import type { MappingToEventUnion, EventUnionToMap, BehaviorMapping, EventObject } from './types';
import type { ActorContext, Behavior, TaggedState } from 'xactor/dist/types';
import { createSetupBehavior, isSignal } from 'xactor';
import { getMappedValue } from './util';

// No explicit types
export function mappedSetupBehavior<Mapping extends BehaviorMapping<State>, State>(
  setup: (initialState: State, ctx: ActorContext<MappingToEventUnion<Mapping, State>>) => State | TaggedState<State>,
  mapping: Mapping,
  initial: State
): Behavior<MappingToEventUnion<Mapping, State>, State>;

// Explicit types
export function mappedSetupBehavior<Mapping extends EventObject, State, Strict extends true | false = false>(
  setup: (initialState: State, ctx: ActorContext<Mapping>) => State | TaggedState<State>,
  mapping: EventUnionToMap<Mapping, State, Strict>,
  initial: State
): Behavior<Mapping, State>;

export function mappedSetupBehavior<Mapping extends BehaviorMapping<State>, State>(
  setup: (initialState: State, ctx: ActorContext<MappingToEventUnion<Mapping, State>>) => State | TaggedState<State>,
  mapping: Mapping,
  initial: State
): Behavior<MappingToEventUnion<Mapping, State>, State> {
  return createSetupBehavior(
    setup,
    (state, message, context) => {
      if (message.type in mapping) return getMappedValue(mapping, message, context, state, message.type);
      else if (isSignal(message)) return state;
      else if ('default' in mapping) return getMappedValue(mapping, message, context, state, 'default');
      else return state;
    },
    initial
  );
}
