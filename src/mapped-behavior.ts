import type { BehaviorEvent, BehaviorMap, EventObject, EventObjects, ReturnEventUnion, VerifyMapping } from './types';
import type { Behavior } from 'xactor/dist/types';
import { createBehavior, isSignal } from 'xactor';
import { getMappedValue } from './util';

export function mappedBehavior<Mapping extends BehaviorEvent<TState>, TState>(
  mapping: Mapping,
  state: TState
): Behavior<ReturnEventUnion<Mapping, TState>, TState>;
export function mappedBehavior<Mapping extends EventObject, TState>(
  mapping: BehaviorMap<Mapping, TState>,
  state: TState
): Behavior<Mapping, TState>;
export function mappedBehavior<Mapping extends EventObjects | BehaviorEvent<TState>, TState>(
  mapping: BehaviorMap<Mapping, TState>,
  state: TState
): Behavior<ReturnEventUnion<VerifyMapping<Mapping, TState>, TState>> {
  return createBehavior((state, message, context) => {
    if (message.type in mapping) return getMappedValue(mapping, message, context, state, message.type);
    else if (isSignal(message)) return state;
    else if ('default' in mapping) return getMappedValue(mapping, message, context, state, 'default');
    else return state;
  }, state);
}
