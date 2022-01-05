import type { ActorContext, ActorSignal } from 'xactor/dist/types';

export type EventObject<K = string> = {
  type: K;
};
export type DefaultEventObjects = { type: 'default' } | ActorSignal;
export type EventObjects = EventObject | DefaultEventObjects;

// Map to union type
type EventTypeMap<T extends BehaviorEvent<State>, State> = {
  [K in keyof T]: K extends string ? { type: K } & Omit<Parameters<T[K]>[1], 'type'> : never;
}[keyof T];

// Turns map to a union of event types
type CallbackEventTypes<T extends BehaviorEvent<State>, State> = EventTypeMap<T, State> extends EventObjects
  ? EventTypeMap<T, State>
  : never;

// Gets an event by union type
type EventByName<E extends EventObjects['type'], T extends EventObjects> = T extends { type: E }
  ? T extends EventObjects
    ? T
    : never
  : never;

// Exclusive mapping for behavior event maps, maps union to BehaviorEvent
export type BehaviorEventMap<
  Event extends EventObject,
  State,
  Strict extends true | false = false,
  TContext = ActorContext<Event>,
  Events = { [E in Event['type']]: (state: State, msg: EventByName<E, Event>, ctx: TContext) => State }
> =
  | (Strict extends true ? Events : Partial<Events>) & {
      [E in DefaultEventObjects['type']]?: (state: State, msg: EventByName<E, Event>, ctx: TContext) => State;
    };

// Returns either a map or union of event types
export type BehaviorMap<
  Event extends EventObjects | BehaviorEvent<State>,
  State,
  TContext = ActorContext<Event extends EventObjects ? Event : EventObjects>
> = Event extends BehaviorEvent<State>
  ? CallbackEventTypes<Event, State>
  : Event extends EventObject
  ? BehaviorEventMap<Event, State, false, TContext>
  : never;

// Returns map of event types to event handlers
export type BehaviorEvent<
  State,
  Message extends EventObjects = never,
  Ctx = ActorContext<never>,
  Keys extends PropertyKey = PropertyKey
> = { [key in Keys]: (state: State, message: Message, ctx: Ctx) => State };

/**
 * Returns type checked mapping:
 * - {update: (state, msg: {value: number}) => msg.value} -> {update: (state, msg: {value: number}) => msg.value}
 * - {type: 'update', value: number} -> {update: (state, msg: {value: number}) => msg.value}
 */
export type VerifyMapping<
  Reduce extends BehaviorEvent<State> | EventObject,
  State
> = Reduce extends BehaviorEvent<State> ? Reduce : Reduce extends EventObject ? BehaviorEventMap<Reduce, State> : never;

/**
 * Returns the union of all event types:
 * - {update: (state, msg: {value: number}) => msg.value} -> {type: 'update', value: number}
 * - {type: 'update', value: number} -> {type: 'update', value: number}
 */
export type ReturnEventUnion<
  Reduce extends BehaviorEvent<State> | EventObject,
  State
> = Reduce extends BehaviorEvent<State> ? BehaviorMap<Reduce, State> : Reduce extends EventObject ? Reduce : never;
