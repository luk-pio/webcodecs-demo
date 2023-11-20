export const cameraConfig = {
    frameRate: 30,
    codec: "vp8",
    bitrate: 2_000_000
}

export const captureConfig = {
    pattern: "00110011001100110011",
    duration: secondsInMilliseconds(10),
    handlers: { '0': setBlackBackground, '1': setWhiteBackground }
}

function secondsInMilliseconds(seconds) {
    return seconds * 1000
}

function setBlackBackground() {
    document.body.style.backgroundColor = "black"
}

function setWhiteBackground() {
    document.body.style.backgroundColor = "white"
}

