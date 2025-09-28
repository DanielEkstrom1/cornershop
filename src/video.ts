import Hls from "hls.js";

const videoUrl = new URL("../video/out.m3u8", import.meta.url).href;

export function setupVideo(element: HTMLVideoElement, input: HTMLInputElement) {
  if (Hls.isSupported()) {
    var hls = new Hls();

    hls.on(Hls.Events.MEDIA_ATTACHED, function (event, data) {
      console.log("video and hls.js are now bound together !");
    });

    hls.on(Hls.Events.LEVEL_LOADED, function (event, data) {
      console.log("Level loaded")
    });
    hls.on(Hls.Events.BUFFER_APPENDING, function(event, data) {
      console.log(data)
    })
    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      console.log(event);
      console.log(data)
      console.log(
        "manifest loaded, found " + data.levels.length + " quality level",
      );
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      var errorType = data.type;
      var errorDetails = data.details;
      var errorFatal = data.fatal;

      console.log(data);

      switch (data.details) {
        case Hls.ErrorDetails.FRAG_LOAD_ERROR:
          console.log("Frag load error");

          // ....
          break;
        default:
          break;
      }
    });
    hls.loadSource(videoUrl);
    hls.attachMedia(element);
  }
}

export function playVideo(element: HTMLVideoElement) {
  element.play();
}
