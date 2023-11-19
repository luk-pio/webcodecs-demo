let workerState = null;

self.addEventListener('message', function (event) {
  main(event)
});

self.addEventListener('error', function (event) {
  reportError(event)
});

function main(event) {
  const type = event.data.type
  console.info("Worker received event: ", event.data)
  if (type === "start") {
    captureStart(event.data)
  }
  else if (type === "capture") {
    captureFrame(event.data)
  }
  else if (type === "stop") {
    captureStop(event.data)
  }
  else {
    throw new Error('Unrecognized video worker event')
  }
}

async function captureStart({ videoFrameStream, videoStreamTrackSettings, cameraConfig }) {
  let frameCounter = 0;

  const { width, height } = videoStreamTrackSettings

  const encoderConfig = {
    codec: cameraConfig.codec,
    width: width,
    height: height,
    bitrate: cameraConfig.bitrate,
    framerate: cameraConfig.frameRate
  };

  const chunks = []

  frameReader = videoFrameStream.getReader();

  const init = {
    output: (chunk) => {
      chunks.push(chunk)
    },
    error: (error) => {
      reportError(error)
      stopRecording();
    }
  };
  let encoder = new VideoEncoder(init);
  let support = await VideoEncoder.isConfigSupported(encoderConfig);
  if (!support) {
    reportError(new Error("Video Config is not supported by this browser"))
  }
  encoder.configure(encoderConfig);

  workerState = { frameCounter, frameReader, encoder, chunks }
  postMessage({ type: "ready" })
}

function reportError(e) {
  postMessage({ type: "error", message: e.message });
}

async function captureFrame() {
  validateWorkerState()
  const { frameReader, encoder } = workerState
  const frame = await frameReader.read()
  const { value, done } = frame

  if (done) {
    captureStop(encoder)
    return;
  }

  encoder.encode(value, { keyFrame: true });
  await value.close();
  postMessage({ type: "frameCaptured" })
};

async function captureStop() {
  validateWorkerState()
  const encoder = workerState.encoder
  await encoder.flush();
  encoder.close();
  postMessage({ type: "finished", chunks: workerState.chunks })
}

function validateWorkerState() {
  if (!workerState) {
    throw new Error("Tried to capture video frame with uninitialized video worker state")
  }
}