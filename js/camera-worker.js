import { errorHandler } from "./error.js";

export class CameraWorker {
    constructor(cameraStream) {
        this.cameraStream = cameraStream
    }

    async initializeFrameCaptureWorker() {
        this.trackProcessor = getTrackProcessor(this.cameraStream.videoStreamTrack)
        this.videoFrameStream = getFrameStream(this.trackProcessor)
        this.worker = new Worker('./js/video-worker.js');
        this.worker.onerror = errorHandler
    }

    async startCameraWorker() {
        await this.initializeFrameCaptureWorker()
        this.worker.postMessage({
            type: 'captureStart',
            videoFrameStream: this.videoFrameStream,
            videoStreamTrackSettings: this.cameraStream.videoStreamTrackSettings
        }, [this.videoFrameStream]);
        await receiveWorkerMessage(this.worker, 'ready')
    }

    async captureFrame() {
        this.worker.postMessage({
            type: 'captureFrame'
        })
    }

    async stopCameraWorker() {
        this.worker.postMessage({
            type: 'captureStop'
        })
        const message = await receiveWorkerMessage(this.worker, 'finished')
        this.encodedChunks = message.chunks
        this.cameraStream.stopCameraStream()
    }

    get encodedChunks() {
        return this.encodedChunks
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