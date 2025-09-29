import "./style.css";
import Router from "./router.ts";
import { render as homeRender, setup as homeSetup } from "./index.ts";
import { render as aboutRender } from "./about/index.ts";

const router = new Router();

router.addRoute("/", homeRender, homeSetup);
router.addRoute("/about", aboutRender);

router.start();
