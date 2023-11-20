import { cameraConfig } from "./config.js";

export async function displayFrames(encodedChunks) {
    const canvasElement = document.getElementById('frame-display');
    const decoderConfig = { codec: cameraConfig.codec, canvasElement }
    const decoder = new Decoder(decoderConfig);

    let currentChunkIndex = 0

    decoder.decode(encodedChunks[currentChunkIndex])

    document.getElementById('prev-button').addEventListener('click', async () => {
        currentChunkIndex = Math.abs((currentChunkIndex - 1) % encodedChunks.length)
        decoder.decode(encodedChunks[currentChunkIndex])
    });

    document.getElementById('next-button').addEventListener('click', async () => {
        currentChunkIndex = Math.abs((currentChunkIndex + 1) % encodedChunks.length)
        decoder.decode(encodedChunks[currentChunkIndex])
    });
}

class Decoder {
    constructor(config) {
        this.currentFrame = null;
        this.videoDecoder = new VideoDecoder({
            output: frame => {
                this.#displayOnCanvas(frame);
            },
            error: e => {
                console.error(e);
            }
        });
        this.videoDecoder.configure(config);
        this.canvasElement = config.canvasElement
    }

    async decode(chunk) {
        this.videoDecoder.decode(chunk);
    }

    #displayOnCanvas(frame) {
        // Create an OffscreenCanvas for rendering
        const offscreenCanvas = new OffscreenCanvas(frame.codedWidth, frame.codedHeight);
        const ctx = offscreenCanvas.getContext('2d');

        // Draw the frame
        ctx.drawImage(frame, 0, 0);

        // Transfer the frame to the main canvas
        this.canvasElement.width = frame.codedWidth;
        this.canvasElement.height = frame.codedHeight;
        const mainCtx = this.canvasElement.getContext('2d');
        mainCtx.drawImage(offscreenCanvas, 0, 0);
        frame.close();
    }

    async close() {
        await this.videoDecoder.flush();
        this.videoDecoder.close();
    }
}