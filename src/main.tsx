import { createRoot } from "react-dom/client";
import Video from "./pages/Video.tsx";
import "./style.css";
import "./htmlplayer.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";

const router = createBrowserRouter([
        {
                path: "/",
                Component: App,
                children: [
                        { index: true, Component: Home },
                        { path: "video", Component: Video },
                        { path: "about", Component: About }
                ]
        },
])

createRoot(document.getElementById("root")!).render(
        <RouterProvider router={router} />
);
