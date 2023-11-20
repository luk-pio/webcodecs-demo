# WebCodecs API Demo

This is a demo of the WebCodecs API. It initializes a camera stream using the webcam with the highest resolution. Over a period of 10 seconds the screen will toggle between black and white. The frames are captured and encoded using the WebCodecs API. The encoded frames are then displayed on the webpage using a canvas element and can be toggled between using the buttons on the page.

## Instructions

The website can be accessed at [webcodecs-demo.netlify.app](https://webcodecs-demo.netlify.app/).

Since this demo has no external dependencies, all you need to run it locally is clone the repository and run:

```bash
    python3 -m http.server 9091 -d .
```

You can then access the demo at [localhost:9091](http://localhost:9091).

## Configuration

The configuration for the demo is in the `config.js` file. The following parameters can be configured:

### For the camera encoder

- `videoWidth`: The width of the video stream.
- `bitRate`: The bit rate to use for encoding.
- `codec`: The codec to use for encoding.

### For the pattern

- `pattern`: The pattern to use for the frame capture.
- `handlers`: The handlers to use for the pattern. This should be a map of the form `{ 'char': handler }` where `char` is a character in the pattern and `handler` is a function that will be run before capturing the frame corresponding to the character in the pattern.
- `duration`: The duration of the pattern in seconds.

## Running tests

I have written tests for the function which handles running the frame capture according to the configuration pattern. The tests can be run using `npm run test`.

## Notes

- Due to lack of time I decided to write unit tests for the most important part of the application.
- I have tried to keep the code cleanly encapsulated and write all classes so that they could be potentially swapped out for a different implementation as long as the "duck type" interface is maintained.
- Many of the functions are pure functions and I have tried to keep the code as functional as possible where practical and useful to do so.
- Given more time I would have refactored to make dependency injection possible in more places as to make testing easier.
