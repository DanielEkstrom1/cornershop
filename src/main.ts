import "./style.css";
import Router from "./router.ts";
import { render as homeRender, setup as homeSetup } from "./index.ts";
import { render as aboutRender } from "./about/index.ts";
import { render as videoRender, setup as videoSetup, destroy as destroyVideo } from "./video/index.ts";

const router = new Router();

const websocket = new WebSocket(`ws://${window.location.host}/api/socket`)

websocket.onerror = (event) => {
  console.log(event)
}
websocket.onopen = (event) => {
  websocket.send("Hello from client")
  console.log(event)
}

router.addRoute("/", homeRender, homeSetup);
router.addRoute("/about", aboutRender);
router.addRoute("/video", videoRender, videoSetup, destroyVideo);

router.start();
