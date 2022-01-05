## xactor mapped behaviors

[![NPM](https://nodei.co/npm/xactor-mapped-behaviors.png)](https://www.npmjs.com/package/xactor-mapped-behaviors)

Declarative mapping of event types to behaviors.

Installation: 
- yarn: ``` yarn add xactor-mapped-behaviors ``` 
- npm: ``` npm i xactor-mapped-behaviors ```
- yarn: ``` pnpm add xactor-mapped-behaviors ```

This library exports two functions: `mappedBehavior` and `mappedSetupBehavior` which correspond to xactors `createBehavior` and `createSetupBehavior` respectively.

The types of both `mapped` behaviors match xactors except for the reducer argument. In `xactor-mapped-behaviors`, instead of a reducer, a keyed object is used. 
Each key corresponds to:
- `string` which is any event type you specify, 
- `default` which is called when no other event type matches
- `ActorSignalType` from xactor. You can either explicitly specify the event types or the event types will be inferred. See below for examples.

Notes:

- If no `default` is specified, the behavior will return the current state if no other event type matches.

Examples:

```typescript
import {mappedBehavior} from "xactor-mapped-behaviors";
import {ActorSignalType} from "xactor/dist/types";
// Behaviors are a keyed object of reducer events, similar to transition event assigns in xstate.
// Each event takes the state, event message and context as arguments and returns the next state.
const behavior = mappedBehavior(
    {
        update: (state, msg: { value: number }, ctx) => msg.value,
        reset: () => 0,
        default: (state, msg, ctx) => state, // default behavior if no match
        [ActorSignalType.Start]: (state) => {
            console.log("Actor start");
            return state;
        }, // Handle actor signal types
    },
    0
);

// Infers event types.
// type TEvent = { type: 'update'; value: number } | { type: 'reset' };
const system = createSystem(behavior, 'counter');

system.send({type: 'update', value: 1});

system.getSnapshot() // 1

system.send({type: 'update', value: 1, foo: 'bar'}); // Typescript Error: Property 'foo' does not exist on type '{ type: "update"; value: number; }'.

system.send({type: 'reset'})

system.getSnapshot() // 0
```

```typescript
import {mappedBehavior} from "xactor-mapped-behaviors";
// explicit event types 
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


