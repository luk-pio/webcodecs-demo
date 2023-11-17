export async function decode(encodedChunks) {
    // Create a VideoDecoder
    const videoDecoder = new VideoDecoder({
        output: frame => {
            // Handle the decoded frame
            renderFrame(frame);
            frame.close();
        },
        error: e => {
            console.error(e);
        }
    });

    videoDecoder.configure({ codec: 'vp8' /* specify the appropriate codec */ });

    // Decode the chunks
    encodedChunks.forEach(chunk => {
        videoDecoder.decode(chunk);
    });

    function renderFrame(frame) {
        // Create an OffscreenCanvas for rendering
        debugger;
        const offscreenCanvas = new OffscreenCanvas(frame.codedWidth, frame.codedHeight);
        const ctx = offscreenCanvas.getContext('2d');

        // Draw the frame
        ctx.drawImage(frame, 0, 0);

        // Transfer the frame to the main canvas
        const mainCanvas = document.getElementById('canvas');
        mainCanvas.width = frame.codedWidth;
        mainCanvas.height = frame.codedHeight;
        const mainCtx = mainCanvas.getContext('2d');
        mainCtx.drawImage(offscreenCanvas, 0, 0);
    }

    await videoDecoder.flush()
    // Don't forget to close the decoder when done
    videoDecoder.close();
}