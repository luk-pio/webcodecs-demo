import { cameraConfig } from "../config.js";
import { errorHandler } from "../error.js";

export class FrameCaptureWorker {
    constructor(cameraStream) {
        this.cameraStream = cameraStream
    }

    async #initializeFrameCaptureWorker() {
        this.trackProcessor = getTrackProcessor(this.cameraStream.videoStreamTrack)
        this.videoFrameStream = getFrameStream(this.trackProcessor)
        this.worker = new Worker('./js/frame-capture/worker.js');
        this.worker.onerror = errorHandler
        this.worker.onmessageerror = errorHandler
    }

    async start() {
        await this.#initializeFrameCaptureWorker()
        const { width, height } = this.cameraStream.videoStreamTrackSettings
        const encoderConfig = {
            codec: cameraConfig.codec,
            width,
            height,
            bitrate: cameraConfig.bitrate,
            framerate: cameraConfig.frameRate
        }
        this.worker.postMessage({
            type: 'start',
            videoFrameStream: this.videoFrameStream,
            encoderConfig
        }, [this.videoFrameStream]);
        await receiveWorkerMessage(this.worker, 'ready')
    }

    async captureFrame() {
        this.worker.postMessage({
            type: 'capture'
        })
        const message = await receiveWorkerMessage(this.worker, 'captured')
        return message
    }

    async stop() {
        this.worker.postMessage({
            type: 'stop'
        })
        const message = await receiveWorkerMessage(this.worker, 'finished')
        return message
    }
}

function getTrackProcessor(track) {
    return new MediaStreamTrackProcessor(track)
}

function getFrameStream(trackProcessor) {
    return trackProcessor.readable
}

async function receiveWorkerMessage(worker, type) {
    return new Promise((resolve, reject) => {
        worker.onmessage = function (event) {
            if (event.data.type === type) {
                resolve(event.data);
            }
        };

        worker.onerror = function (error) {
            reject(error);
        };
    });
}