import type { BehaviorEvent, BehaviorMap, EventObject, ReturnEventUnion, VerifyMapping } from './types';
import type { Behavior } from 'xactor/dist/types';
import { createBehavior, isSignal } from 'xactor';
import { getMappedValue } from './util';
import { BehaviorEventMap } from './types';

// No explicit types
export function mappedBehavior<Mapping extends BehaviorEvent<State>, State>(
  mapping: Mapping,
  initial: State
): Behavior<ReturnEventUnion<Mapping, State>, State>;

// Explicit types
export function mappedBehavior<Mapping extends EventObject, State, Strict extends true | false = true>(
  mapping: BehaviorEventMap<Mapping, State, Strict>,
  initial: State
): Behavior<Mapping, State>;

/**
 * Maps event types, through a keyed object, to a behavior reducer
 * @param mapping {BehaviorMap<Mapping, State>} An object that maps events to behaviors.
 * @param initial {State} The initial state of the behavior.
 */
export function mappedBehavior<Mapping extends EventObject | BehaviorEvent<State>, State>(
  mapping: BehaviorMap<Mapping, State>,
  initial: State
): Behavior<ReturnEventUnion<VerifyMapping<Mapping, State> | EventObject, State>> {
  return createBehavior((state, message, context) => {
    if (message.type in mapping) return getMappedValue(mapping, message, context, state, message.type);
    else if (isSignal(message)) return state;
    else if ('default' in mapping) return getMappedValue(mapping, message, context, state, 'default');
    else return state;
  }, initial);
}
