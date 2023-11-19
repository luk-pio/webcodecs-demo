export class CameraStream {
    constructor(device) {
        this.device = device
    }

    async start(navigator) {
        const { videoStream, videoStreamTrack } = await initializeVideoStream(navigator, this.device);
        this.videoStream = videoStream
        this.videoStreamTrack = videoStreamTrack
        return videoStreamTrack
    }

    get videoStreamTrackSettings() {
        return this.videoStreamTrack.getSettings()
    }

    async stop() {
        this.videoStreamTrack.stop()
    }
}

export async function getCameraDevice(navigator) {
  const mediaDevices = getMediaDevices(navigator)
  const devices = await getVideoDevices(mediaDevices)
  const device = getBestDevice(devices)
  return device
}

function getMediaDevices(navigator) {
  const mediaDevices = navigator?.mediaDevices
  return mediaDevices
}

export async function initializeVideoStream(navigator, device) {
  const videoStream = await getVideoStream(navigator, device)
  const videoStreamTrack = await getVideoStreamTrack(videoStream)
  return { videoStream, videoStreamTrack }
}

export function displayVideoStream(videoStream) {
  const videoElement = document.getElementById('src');
  videoElement.srcObject = videoStream;
}

async function getVideoDevices(mediaDevices) {
  const devices = await mediaDevices.enumerateDevices()
  const videoDevices = devices.filter(device => device.kind === "videoinput")
  return videoDevices
}


function getDeviceResolution(device) {
  const { width, height } = device.getCapabilites()
  return width * height
}

function deviceResolutionComparator(deviceA, deviceB) {
  return getDeviceResolution(deviceA) - getDeviceResolution(deviceB)
}

function getBestDevice(devices, comparator = deviceResolutionComparator) {
  if (devices.length < 1) { throw new Error("No devices provided") }
  const sortedDevices = devices.sort(comparator)
  return sortedDevices[0]
}

async function getVideoStreamTrack(stream) {
  const tracks = stream.getVideoTracks()
  const track = tracks[0]
  return track
}

async function getVideoStream(navigator, device) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: device });
  return stream;
}