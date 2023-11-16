import { startCapture } from "./capture.js";
import { displayError, unhandledRejectionHandler, errorHandler } from "./error.js";

addEventListener("load", main);
addEventListener("unhandledrejection", unhandledRejectionHandler);
addEventListener("error", errorHandler);

async function main() {
  if (!checkWebcodecSupport()) {
    displayError("Your browser must support WebCodecs to use this page. Please use one of the supported browsers https://caniuse.com/webcodecs");
    return
  }
  const captureButton = document.getElementById('capture-button')
  captureButton.onclick = startCapture
}

function checkWebcodecSupport() {
  if (self.isSecureContext === false) {
    throw new Error('WebCodecs can only be used in secure contexts (HTTPS or localhost), https://developer.chrome.com/en/articles/webcodecs/#use')
  }
  return 'VideoEncoder' in window;
}
