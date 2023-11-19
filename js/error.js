export function displayError(message) {
    const errorContainer = document.getElementById("error-container")
    errorContainer.innerText = message
}

export function errorHandler(event) {
    displayError(event?.message || "Unknown error")
}

export function unhandledRejectionHandler(event) {
    displayError(event?.reason?.code || "Unknown error")
}