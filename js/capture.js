import { errorHandler } from "./error.js";
import { displayVideoStream, initializeVideoStream } from "./video-stream.js";

function setBlackBackground() {
    document.body.style.backgroundColor = "black"
}

function setWhiteBackground() {
    document.body.style.backgroundColor = "white"
}

const captureConfig = {
    pattern: "01",
    duration: 10 ** 3,
    handlers: { '0': setBlackBackground, '1': setWhiteBackground }
}

export async function startCapture() {
    const { videoStream, videoStreamTrack, videoStreamTrackSettings } = await initializeVideoStream()
    displayVideoStream(videoStream)
    const trackProcessor = getTrackProcessor(videoStreamTrack)
    const videoFrameStream = getFrameStream(trackProcessor)
    const videoWorker = new Worker('./js/video-worker.js');
    videoWorker.onerror = errorHandler
    videoWorker.postMessage({
        type: 'captureStart',
        videoFrameStream,
        videoStreamTrackSettings
    }, [videoFrameStream]);
    await workerReady(videoWorker)
    await runCapture(videoWorker, captureConfig)
    videoWorker.postMessage({
        type: 'captureStop'
    })
    videoStreamTrack.stop()
}

function getTrackProcessor(track) {
    return new MediaStreamTrackProcessor(track)
}

function getFrameStream(trackProcessor) {
    return trackProcessor.readable
}

async function workerReady(worker) {
    return new Promise((resolve, reject) => {
        worker.onmessage = function (event) {
            if (event.data.type === 'ready') {
                resolve(true);
            }
        };

        worker.onerror = function (error) {
            reject(error);
        };
    });
}

async function runCapture(videoWorker, { handlers, pattern, duration }) {
    validateHandlers(handlers, pattern)
    const intervalDuration = duration / pattern.length
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        handlers[char]()
        console.log("Fired handler for char: " + char)
        console.log("At: " + performance.now())
        videoWorker.postMessage({
            type: 'captureFrame',
        })
        await wait(intervalDuration)
    }
}

async function wait(duration) {
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, duration)
    })
}

function validateHandlers(handlers, pattern) {
    const patternChars = new Set(pattern.split(""));
    const missingHandlers = [...patternChars].filter(char => !(char in handlers))
    if (missingHandlers.length) {
        throw new Error(`Missing handlers for characters: ${missingHandlers}`)
    }
}