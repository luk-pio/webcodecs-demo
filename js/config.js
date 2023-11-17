
export const captureConfig = {
    pattern: "01",
    duration: 10 ** 3,
    handlers: { '0': setBlackBackground, '1': setWhiteBackground }
}

function setBlackBackground() {
    document.body.style.backgroundColor = "black"
}

function setWhiteBackground() {
    document.body.style.backgroundColor = "white"
}
