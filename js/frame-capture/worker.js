let worker = null

self.addEventListener('message', main);
self.addEventListener('error', reportError);
self.addEventListener("unhandledrejection", reportError);

async function main(event) {
  const type = event.data.type
  console.info("Worker received event: ", event.data)
  if (type === "start") {
    if (worker) {
      throw new Error("Tried to start video worker when it was already started")
    }
    worker = new Worker(event.data)
    await worker.start()
  }
  else if (type === "capture") {
    if (!worker) {
      throw new Error("Tried to capture video frame with uninitialized video worker state")
    }
    worker.capture(event.data)
  }
  else if (type === "stop") {
    if (!worker) {
      throw new Error("Tried to stop video frame capture with uninitialized video worker state")
    }
    worker.stop(event.data)
  }
  else {
    throw new Error('Unrecognized video worker event')
  }
}


function reportError(e) {
  postMessage({ type: "error", message: e.message });
}

class Worker {
  constructor({ videoFrameStream, encoderConfig }) {
    this.videoFrameStream = videoFrameStream
    this.encoderConfig = encoderConfig
  }

  async start() {
    const { encoder, chunks } = await createEncoder(this.encoderConfig)
    this.frameReader = this.videoFrameStream.getReader();
    this.encoder = encoder
    this.chunks = chunks
    this.postMessage({ type: "ready" })
  }

  async capture() {
    this.validateWorkerState()
    const frame = await this.frameReader.read()
    const { value, done } = frame

    if (done) {
      this.stop()
      return;
    }

    // If we wanted to stream the chunks over the network, or to a file,
    // we could do that here by copying to an Array Buffer and e.g.
    // transferring ownership to another worker.
    // For now though, it's simpler to just store the chunks in memory and 
    // copy to the main thread when we're done.
    this.encoder.encode(value, { keyFrame: true });
    await value.close();
    this.postMessage({ type: "frameCaptured" })
  };

  async stop() {
    this.validateWorkerState()
    await this.encoder.flush();
    this.encoder.close();
    postMessage({ type: "finished", chunks: this.chunks })
  }

  validateWorkerState() {
    if (!this.encoder || !this.chunks || !this.frameReader || !this.videoFrameStream || !this.encoderConfig) {
      throw new Error("Tried to capture video frame with uninitialized video worker state")
    }
  }

  postMessage(message) {
    postMessage(message)
  }
}

async function createEncoder(encoderConfig) {
  const chunks = []

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
    throw new Error("Video Config is not supported by this browser")
  }
  encoder.configure(encoderConfig);
  return { chunks, encoder }
}