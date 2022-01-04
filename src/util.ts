import { BehaviorEvent, EventObject } from './types';
import { ActorContext } from 'xactor/dist/types';

export const getMappedValue = <Mapping extends BehaviorEvent<TState>, TState, Message = unknown>(
  mapping: Mapping,
  message: Message,
  context: ActorContext<EventObject>,
  state: TState,
  key: keyof Mapping | PropertyKey
) => {
  const rtn = mapping[key as keyof Mapping](state, message, context);
  if (rtn !== void 0) return rtn;
  else return state;
};
