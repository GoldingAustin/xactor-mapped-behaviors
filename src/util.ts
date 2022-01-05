import { BehaviorEvent, EventObject } from './types';
import { ActorContext } from 'xactor/dist/types';

export const getMappedValue = <Mapping extends BehaviorEvent<TState>, TState, Message = unknown>(
  mapping: Mapping,
  message: Message,
  context: ActorContext<EventObject>,
  state: TState,
  key: keyof Mapping | PropertyKey
) => {
  return mapping[key as keyof Mapping](state, message, context);
};
