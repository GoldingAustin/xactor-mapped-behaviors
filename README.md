## xactor mapped behaviors

Declarative mapping of event types to behaviors.

```typescript
import {mappedBehavior} from "xactor-mapped-behaviors";
// Behaviors are a keyed object of reducer events, similar to transition event assigns in xstate.
// Each event takes the state, event message and context as arguments and returns the next state.
const behavior = mappedBehavior(
    {
        update: (state, msg: { value: number }, ctx) => msg.value,
        reset: () => 0,
        default: (state, msg, ctx) => state,
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


