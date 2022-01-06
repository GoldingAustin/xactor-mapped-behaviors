import type { ActorContext, ActorSignal } from 'xactor/dist/types';

export type EventObject<K = string> = {
  type: K;
};
export type DefaultEventObjects = { type: 'default' } | ActorSignal;
export type EventObjects = EventObject | DefaultEventObjects;

// Gets an event by union type
type EventByName<E extends EventObjects['type'], T extends EventObjects> = T extends { type: E }
  ? T extends EventObjects
    ? T
    : never
  : never;

// Map to union type
type EventTypeMap<T extends BehaviorMapping<State>, State> = {
  [K in keyof T]: K extends string ? { type: K } & Omit<Parameters<T[K]>[1], 'type'> : never;
}[keyof T];

// Turns map to a union of event types
export type MappingToEventUnion<T extends BehaviorMapping<State>, State> = EventTypeMap<T, State> extends EventObjects
  ? EventTypeMap<T, State>
  : never;

// Exclusive mapping for behavior event maps, maps union to BehaviorEvent
export type EventUnionToMap<
  Event extends EventObject,
  State,
  Strict extends true | false = false,
  TContext = ActorContext<Event>,
  Events = { [E in Event['type']]: (state: State, msg: EventByName<E, Event>, ctx: TContext) => State }
> =
  | (Strict extends true ? Events : Partial<Events>) & {
      [E in DefaultEventObjects['type']]?: (state: State, msg: EventByName<E, Event>, ctx: TContext) => State;
    };

// Returns map of event types to event handlers
export type BehaviorMapping<
  State,
  Message extends EventObjects = never,
  Ctx = ActorContext<never>,
  Keys extends PropertyKey = PropertyKey
> = { [key in Keys]: (state: State, message: Message, ctx: Ctx) => State };
