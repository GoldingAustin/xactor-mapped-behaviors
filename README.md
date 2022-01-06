## xactor mapped behaviors

[![NPM](https://nodei.co/npm/xactor-mapped-behaviors.png)](https://www.npmjs.com/package/xactor-mapped-behaviors)

### Introduction

Declarative mapping of event types to behaviors.

Installation: 
- yarn: ``` yarn add xactor-mapped-behaviors ``` 
- npm: ``` npm i xactor-mapped-behaviors ```
- yarn: ``` pnpm add xactor-mapped-behaviors ```

Current size: [~336B](https://bundlephobia.com/package/xactor-mapped-behaviors@1.1.2)

Required peer dependencies: [xactor](https://www.npmjs.com/package/xactor)

This library exports two functions: `mappedBehavior` and `mappedSetupBehavior` which correspond to xactors `createBehavior` and `createSetupBehavior` respectively.

The types of both `mapped` behaviors match xactors except for the reducer argument. In `xactor-mapped-behaviors`, instead of a reducer, a keyed object is used. 
Each key corresponds to:
- `string` which is any event type you specify, 
- `default` which is called when no other event type matches
- `ActorSignalType` from xactor. You can either explicitly specify the event types or the event types will be inferred. See below for examples.

#### Interface

- `mappedBehavior<Events, State, Strict>`
  - Type Arguments:
    - `Events`: The type of events that the behavior will receive. e.g. `{ type: 'response'; value: object } | {type: 'fetch'; url: string}`
    - `State`: The type of the state that the behavior will receive. e.g. if initial state is `40`, then `State` is `number`
    - `Strict`: If `true`, then the behavior will throw an error if all specified event types are not handled; default is `true`


### Notes

- If no `default` is specified, the behavior will return the current state if no other event type matches.

### Examples

```typescript
import {mappedBehavior} from "xactor-mapped-behaviors";
import {createSystem, ActorSignalType} from "xactor";
// Behaviors are a keyed object of reducer events, similar to transition event assigns in xstate.
// Each event takes the state, event message and context as arguments and returns the next state.
const behavior = mappedBehavior(
    {
        // state and context type are inferred from behavior signature
        update: (state, msg: { value: number }, ctx) => msg.value, // Return type is validated based on behavior state type
        reset: (state, msg: { resetValue?: number }) => msg.resetValue || 0,
        default: (state, msg, ctx) => state, // default behavior if no match
        [ActorSignalType.Start]: (state) => { // Handle actor signal types
            console.log("Actor start");
            return state;
        },
    },
    0
);

// Infers event types.
// type TEvent = { type: 'update'; value: number } | { type: 'reset' } | { type: 'default' }; 
const system = createSystem(behavior, 'counter');

system.send({type: 'update', value: 1});

system.getSnapshot() // 1

system.send({type: 'update', value: 1, foo: 'bar'}); // Error: Property 'foo' does not exist on type '{ type: "update"; value: number; }'.

system.send({type: 'update'}); // Error: Argument of type '{ type: "update"; }' is not assignable to parameter of type '{ type: "update"; value: number; }'

system.send({type: 'reset'})

system.getSnapshot() // 0

system.send({type: 'reset', resetValue: 10})

system.getSnapshot() // 10
```

#### Examples with explicit event types:

##### Default Strict
```typescript
import {mappedBehavior} from "xactor-mapped-behaviors";
// explicit event types
// Strict is true, if 'response' and 'fetch' are not specified, then Typescript will throw an error.
const behavior = mappedBehavior<{ type: 'response'; value: object } | {type: 'fetch'; url: string}, string>(  
    {
        response: (state, msg) => msg.value,
        fetch: (state, msg, ctx) => {
            if (state !== 'idle') return state;
            ctx.spawnFrom(async () => {
                const response = await fetch(msg.url);
                return { type: 'response', value: await response.json() };
            }, 'promise');
            return 'pending';
        },
    },
    'idle'
);

const system = createSystem(behavior, 'promise');
system.send({ type: 'fetch', url: 'https://example.com/' });
```

##### Not Strict
```typescript
import {mappedBehavior} from "xactor-mapped-behaviors";
// Strict is false, if 'response' and 'fetch' are not specified, then Typescript will not throw an error.
const behavior = mappedBehavior<{ type: 'response'; value: object } | {type: 'fetch'; url: string}, string, false>(  
    {
        fetch: (state, msg, ctx) => {
            if (state !== 'idle') return state;
            ctx.spawnFrom(async () => {
                const response = await fetch(msg.url);
                return { type: 'response', value: await response.json() };
            }, 'promise');
            return 'pending';
        },
    },
    'idle'
);
```


