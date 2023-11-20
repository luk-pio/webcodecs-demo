import test from 'node:test';
import assert from 'node:assert'
import { runFrameCapture } from '../js/frame-capture/run-capture.js';

test('should run without errors', async (t) => {
    const worker = {
        captureFrame: function () { }
    };

    const handlers = {
        a: function () { },
        b: function () { }
    };

    const pattern = 'ab';
    const duration = 1;

    let errorOccurred = false;
    try {
        await runFrameCapture(worker, { handlers, pattern, duration });
    } catch (error) {
        console.error(error);
        errorOccurred = true;
    }

    assert.strictEqual(errorOccurred, false)
});

test('should throw an error if the pattern contains characters not present in the handlers', async (t) => {
    const worker = {
        captureFrame: function () { }
    };

    const handlers = {
        a: function () { },
        b: function () { }
    };

    const pattern = 'abc'; // 'c' is not present in the handlers
    const duration = 1;

    let errorOccurred = false;
    try {
        await runFrameCapture(worker, { handlers, pattern, duration });
    } catch (error) {
        errorOccurred = true;
    }

    assert.strictEqual(errorOccurred, true);
});

test('should call handler functions in the correct order', async (t) => {
    const worker = {
        captureFrame: function () { }
    };

    let order = ''
    const handlers = {
        a: () => order += 'a',
        b: () => order += 'b'
    };

    const pattern = 'ababa';
    const duration = 1;

    await runFrameCapture(worker, { handlers, pattern, duration });

    // Check if handlers are called in the correct order
    assert.equal(order, pattern);
});
