import type { BehaviorMapping, EventObject } from './types';
import type { ActorContext } from 'xactor/dist/types';

export const getMappedValue = <Mapping extends BehaviorMapping<State>, State, Message = unknown>(
  mapping: Mapping,
  message: Message,
  context: ActorContext<EventObject>,
  state: State,
  key: keyof Mapping | PropertyKey
) => {
  return mapping[key as keyof Mapping](state, message as never, context);
};
