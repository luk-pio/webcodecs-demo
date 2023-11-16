export async function initializeVideoStream() {
  const mediaDevices = getMediaDevices(navigator)
  const devices = await getVideoDevices(mediaDevices)
  const device = getBestDevice(devices)
  const videoStream = await getVideoStream(mediaDevices, device)
  const videoStreamTrack = await getVideoStreamTrack(videoStream)
  const videoStreamTrackSettings = videoStreamTrack.getSettings()
  return { videoStream, videoStreamTrack, videoStreamTrackSettings }
}

export function displayVideoStream(videoStream) {
  const videoElement = document.getElementById('src');
  videoElement.srcObject = videoStream;
}

function getMediaDevices(navigator) {
  const mediaDevices = navigator?.mediaDevices
  return mediaDevices
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

async function getVideoStream(mediaDevices, device) {
  const stream = await mediaDevices.getUserMedia({ video: device });
  return stream;
}
