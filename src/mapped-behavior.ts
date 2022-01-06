import type { MappingToEventUnion, EventUnionToMap, BehaviorMapping, EventObject } from './types';
import type { Behavior } from 'xactor/dist/types';
import { createBehavior, isSignal } from 'xactor';
import { getMappedValue } from './util';

// No explicit types
export function mappedBehavior<Mapping extends BehaviorMapping<State>, State>(
  mapping: Mapping,
  initial: State
): Behavior<MappingToEventUnion<Mapping, State>, State>;

// Explicit types
export function mappedBehavior<Mapping extends EventObject, State, Strict extends true | false = true>(
  mapping: EventUnionToMap<Mapping, State, Strict>,
  initial: State
): Behavior<Mapping, State>;

/**
 * Maps event types, through a keyed object, to a behavior reducer
 * @param mapping {BehaviorMapping<State>} An object that maps events to behaviors.
 * @param initial {State} The initial state of the behavior.
 */
export function mappedBehavior<Mapping extends BehaviorMapping<State>, State>(
  mapping: Mapping,
  initial: State
): Behavior<MappingToEventUnion<Mapping, State>, State> {
  return createBehavior((state, message, context) => {
    if (message.type in mapping) return getMappedValue(mapping, message, context, state, message.type);
    else if (isSignal(message)) return state;
    else if ('default' in mapping) return getMappedValue(mapping, message, context, state, 'default');
    else return state;
  }, initial);
}
