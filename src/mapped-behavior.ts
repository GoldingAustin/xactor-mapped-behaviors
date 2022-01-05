import type {
  BehaviorEvent,
  BehaviorMap,
  DefaultEventObjects,
  EventObject,
  EventObjects,
  ReturnEventUnion,
  VerifyMapping,
} from './types';
import type { Behavior } from 'xactor/dist/types';
import { createBehavior, isSignal } from 'xactor';
import { getMappedValue } from './util';

export function mappedBehavior<Mapping extends BehaviorEvent<TState>, TState>(
  mapping: Mapping,
  state: TState
): Behavior<ReturnEventUnion<Mapping, TState>, TState>;
export function mappedBehavior<Mapping extends EventObject, TState>(
  mapping: BehaviorMap<Mapping | DefaultEventObjects, TState>,
  state: TState
): Behavior<Mapping, TState>;

/**
 * Maps event types, through a keyed object, to a behavior reducer
 * @param mapping {BehaviorMap<Mapping, TState>} An object that maps events to behaviors.
 * @param initial {TState} The initial state of the behavior.
 */
export function mappedBehavior<Mapping extends EventObjects | BehaviorEvent<TState>, TState>(
  mapping: BehaviorMap<Mapping, TState>,
  initial: TState
): Behavior<ReturnEventUnion<VerifyMapping<Mapping, TState> | EventObjects, TState>> {
  return createBehavior((state, message, context) => {
    if (message.type in mapping) return getMappedValue(mapping, message, context, state, message.type);
    else if (isSignal(message)) return state;
    else if ('default' in mapping) return getMappedValue(mapping, message, context, state, 'default');
    else return state;
  }, initial);
}
