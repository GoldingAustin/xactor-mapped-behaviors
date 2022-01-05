import { BehaviorEvent, EventObject } from './types';
import { ActorContext } from 'xactor/dist/types';

export const getMappedValue = <Mapping extends BehaviorEvent<State>, State, Message = unknown>(
  mapping: Mapping,
  message: Message,
  context: ActorContext<EventObject>,
  state: State,
  key: keyof Mapping | PropertyKey
) => {
  return mapping[key as keyof Mapping](state, message as never, context);
};
