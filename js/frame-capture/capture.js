import { getCameraDevice, CameraStream, displayVideoStream } from "../camera-stream.js"
import { FrameCaptureWorker } from "./frame-capture.js"
import { captureConfig } from "../config.js"
import { displayFrames } from "../decoder.js"

export async function capture() {
    // Initialize the correct camera stream
    const cameraDevice = await getCameraDevice(navigator)
    const cameraStream = new CameraStream(cameraDevice)
    await cameraStream.start(navigator)

    // Display the camera stream to the user
    displayVideoStream(cameraStream.videoStream)

    // Initialize the frame capture worker
    const frameCaptureWorker = new FrameCaptureWorker(cameraStream)
    await frameCaptureWorker.start()

    // Run the frame capture
    await runFrameCapture(frameCaptureWorker, captureConfig)

    // stop the stream and get the encoded chunks
    const workerResponse = await frameCaptureWorker.stop();
    const encodedChunks = workerResponse.chunks;
    await cameraStream.stop();

    // Transfer the encoded chunks to the decoder
    displayFrames(encodedChunks);
}
