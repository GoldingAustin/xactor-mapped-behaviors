/**
 *
 * MIT License
 *
 * Copyright (c) 2020 David Khourshid
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Modified 2022 - Austin Golding
 */

import { ActorRef, createSystem } from 'xactor';
import { mappedBehavior } from '../src';

describe('todo example', () => {
  it('works', (done) => {
    interface TodoState {
      message: string;
      status: 'pending' | 'complete';
    }

    type TodoEvent = { type: 'update'; message: string } | { type: 'toggle' } | { type: 'default' };

    const Todos = () =>
      mappedBehavior<
        | {
            type: 'add';
            message: string;
          }
        | { type: 'update'; index: number; message: string }
        | { type: 'toggle'; index: number }
        | { type: 'default' },
        {
          todos: ActorRef<TodoEvent, TodoState>[];
        }
      >(
        {
          add: (state, msg, ctx) => {
            return {
              ...state,
              todos: state.todos.concat(ctx.spawn(Todo(msg.message), `todo-${state.todos.length}`)),
            };
          },
          update: (state, msg, ctx) => {
            {
              const todo = state.todos[msg.index];

              if (todo) {
                todo.send(msg);
              }
              return state;
            }
          },
          toggle: (state, msg, ctx) => {
            {
              const todo = state.todos[msg.index];

              if (todo) {
                todo.send(msg);
              }
              return state;
            }
          },
          default: (state, msg, ctx) => {
            return state;
          },
        },
        {
          todos: [],
        }
      );

    const Todo = (message: string) =>
      mappedBehavior<TodoEvent, TodoState>(
        {
          update: (state, msg) => {
            if (state.status === 'complete') {
              return state;
            }
            return { ...state, message: msg.message };
          },
          toggle: (state, msg) => {
            return {
              ...state,
              status: state.status === 'pending' ? 'complete' : 'pending',
            };
          },
          default: (state) => state,
        },
        {
          message,
          status: 'pending',
        }
      );

    const todoSystem = createSystem(Todos(), 'todos');

    let todo: ActorRef<TodoEvent, TodoState>;

    todoSystem.subscribe((state) => {
      if (state.todos.length && !todo) {
        todo = state.todos[0];
        todo.subscribe((state) => {
          if (state.message === 'mission accomplished' && state.status === 'complete') {
            done();
          }
        });
        todo.send({
          type: 'update',
          message: 'mission accomplished',
        });

        todo.send({
          type: 'toggle',
        });
      }
    });

    todoSystem.send({ type: 'add', message: 'hello' });
  });
});
