import type { ActorContext } from 'xactor/dist/types';

export type EventObject = {
  type: string;
};
export type EventObjects = EventObject | { type: 'default' };

type EventTypeMap<T extends BehaviorEvent<TState>, TState> = {
  [K in keyof T]: K extends string ? { type: K } & Omit<Parameters<T[K]>[1], 'type'> : never;
}[keyof T];

type CallbackEventTypes<T extends BehaviorEvent<TState>, TState> = EventTypeMap<T, TState> extends EventObjects
  ? EventTypeMap<T, TState>
  : never;

type EventByName<E extends EventObjects['type'], T extends EventObjects> = T extends { type: E }
  ? T extends EventObjects
    ? T
    : never
  : never;

export type BehaviorMap<
  Event extends EventObjects | BehaviorEvent<TState>,
  TState,
  TContext = ActorContext<Event extends EventObject ? Event : EventObject>
> = Event extends BehaviorEvent<TState>
  ? CallbackEventTypes<Event, TState>
  : Event extends EventObjects
  ? {
      [E in Event['type']]: (state: TState, msg: EventByName<E, Event>, ctx: TContext) => TState | void;
    }
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BehaviorEvent<
  State,
  Message extends EventObjects = any,
  Ctx = ActorContext<never>,
  Keys extends PropertyKey = PropertyKey
> = { [key in Keys]: (state: State, message: Message, ctx: Ctx) => State | void };

export type VerifyMapping<
  Reduce extends BehaviorEvent<TState> | EventObjects,
  TState
> = Reduce extends BehaviorEvent<TState> ? Reduce : BehaviorMap<Reduce, TState>;

export type ReturnEventUnion<
  Reduce extends BehaviorEvent<TState> | EventObjects,
  TState
> = Reduce extends BehaviorEvent<TState> ? BehaviorMap<Reduce, TState> : Reduce;
