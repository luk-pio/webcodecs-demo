import { getCameraDevice, CameraStream, displayVideoStream } from "./camera-stream.js"
import { CameraWorker } from "./camera-worker.js"
import { captureConfig } from "./config.js"
import { decode } from "./decoder.js"

export async function capture() {
    const cameraDevice = await getCameraDevice(navigator)
    const cameraStream = new CameraStream(cameraDevice)

    await cameraStream.startCameraStream(navigator)
    displayVideoStream(cameraStream.videoStream)
    const cameraWorker = new CameraWorker(cameraStream)
    await cameraWorker.startCameraWorker()
    await runFrameCapture(cameraWorker, captureConfig)
    const encodedChunks = await cameraWorker.stopCameraWorker();
    decode(encodedChunks);
}

async function runFrameCapture(cameraWorker, { handlers, pattern, duration }) {
    validateHandlers(handlers, pattern)
    const intervalDuration = duration / pattern.length
    for (const char of pattern) {
        runHandler(handlers, char)
        cameraWorker.captureFrame()
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
    console.log("Fired handler for char: " + char)
    console.log("At: " + performance.now())
}

async function wait(duration) {
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, duration)
    })
}