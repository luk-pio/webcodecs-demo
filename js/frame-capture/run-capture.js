export async function runFrameCapture(worker, { handlers, pattern, duration }) {
    validateHandlers(handlers, pattern)
    const intervalDuration = duration / pattern.length
    for (const char of pattern) {
        runHandler(handlers, char)
        worker.captureFrame()
        await wait(intervalDuration)
    }
}

function validateHandlers(handlers, pattern) {
    const patternChars = new Set(pattern.split(""));
    const missingHandlers = [...patternChars].filter(char => !(char in handlers))
    if (missingHandlers.length) {
        throw new Error(`Missing handlers for characters: ${missingHandlers}`)
    }
}

function runHandler(handlers, char) {
    handlers[char]()
    console.log("Firing handler for char: " + char)
    console.log("At: " + performance.now())
}

async function wait(duration) {
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, duration)
    })
}