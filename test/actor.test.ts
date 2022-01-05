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

import { mappedBehavior } from '../src';
import { createSystem } from 'xactor';

describe('getSnapshot() method', () => {
  it('should return a snapshot of the most recently emitted state', () => {
    const behavior = mappedBehavior(
      {
        update: (state, msg: { value: number }) => msg.value,
        default: (state) => state + 1,
      },
      42
    );
    const system = createSystem(behavior, 'test');
    expect(system.getSnapshot()).toEqual(42);
  });

  it('should keep snapshot up to date after state changes', () => {
    const behavior = mappedBehavior<{ type: 'update'; value: number }, number>(
      {
        update: (state, msg) => msg.value,
      },
      42
    );
    const system = createSystem(behavior, 'test');

    expect(system.getSnapshot()).toEqual(42);

    system.send({ type: 'update', value: 55 });

    setTimeout(() => {
      expect(system.getSnapshot()).toEqual(55);
    });
  });

  it('Start should be called', (done) => {
    const behavior = mappedBehavior(
      {
        update: (state, msg: { value: number }) => msg.value,
        [0]: (state) => {
          expect(state).toEqual(42);
          done();
        },
      },
      42
    );
    createSystem(behavior, 'test');
  });
});
