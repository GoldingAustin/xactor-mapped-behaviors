import type { ActorContext, ActorSignal } from 'xactor/dist/types';

export type EventObject = {
  type: string;
};
export type DefaultEventObjects = { type: 'default' } | ActorSignal;
export type EventObjects = EventObject | DefaultEventObjects;

// Map to union type
type EventTypeMap<T extends BehaviorEvent<TState>, TState> = {
  [K in keyof T]: K extends string ? { type: K } & Omit<Parameters<T[K]>[1], 'type'> : never;
}[keyof T];

// Turns map to a union of event types
type CallbackEventTypes<T extends BehaviorEvent<TState>, TState> = EventTypeMap<T, TState> extends EventObjects
  ? EventTypeMap<T, TState>
  : never;

// Gets an event by union type
type EventByName<E extends EventObjects['type'], T extends EventObjects> = T extends { type: E }
  ? T extends EventObjects
    ? T
    : never
  : never;

// Returns either a map or union of event types
export type BehaviorMap<
  Event extends EventObjects | BehaviorEvent<TState>,
  TState,
  TContext = ActorContext<Event extends EventObjects ? Event : EventObjects>
> = Event extends BehaviorEvent<TState>
  ? CallbackEventTypes<Event, TState>
  : Event extends EventObjects
  ? {
      [E in Event['type']]: (state: TState, msg: EventByName<E, Event>, ctx: TContext) => TState;
    }
  : never;

// Returns map of event types to event handlers
export type BehaviorEvent<
  State,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Message extends EventObjects = any,
  Ctx = ActorContext<never>,
  Keys extends PropertyKey = PropertyKey
> = { [key in Keys]: (state: State, message: Message, ctx: Ctx) => State };

/**
 * Returns type checked mapping:
 * - {update: (state, msg: {value: number}) => msg.value} -> {update: (state, msg: {value: number}) => msg.value}
 * - {type: 'update', value: number} -> {update: (state, msg: {value: number}) => msg.value}
 */
export type VerifyMapping<
  Reduce extends BehaviorEvent<TState> | EventObjects,
  TState
> = Reduce extends BehaviorEvent<TState> ? Reduce : BehaviorMap<Reduce, TState>;

/**
 * Returns the union of all event types:
 * - {update: (state, msg: {value: number}) => msg.value} -> {type: 'update', value: number}
 * - {type: 'update', value: number} -> {type: 'update', value: number}
 */
export type ReturnEventUnion<
  Reduce extends BehaviorEvent<TState> | EventObjects,
  TState
> = Reduce extends BehaviorEvent<TState> ? BehaviorMap<Reduce, TState> : Reduce;
