import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

function App() {
        const wsRef = useRef<WebSocket | null>(null);
        const navigate = useNavigate();
        const location = useLocation();

        useEffect(() => {
                const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                if (navEntry && navEntry.type === 'reload' && location.pathname !== "/") {
                        navigate("/", { replace: true });
                }
        }, []);

        useEffect(() => {
                const websocket = new WebSocket(`ws://${window.location.host}/api/socket`);
                wsRef.current = websocket;

                websocket.onerror = (event) => {
                        console.log(event);
                };
                websocket.onopen = (event) => {
                        websocket.send("Hello from client");
                        console.log(event);
                };
                websocket.onmessage = (event) => {
                        console.log(event.data);
                };

                return () => {
                        websocket.close();
                };
        }, []);

        return (
                <div className="min-h-screen bg-base-100">
                        <div className="flex items-center bg-base-200 shadow-lg">
                                <div className="flex-1">
                                        <h1 className="text-xl font-bold">
                                                <Link to="/" className="hover:text-primary">
                                                        Cornershop Media Player
                                                </Link>
                                        </h1>
                                </div>
                                <div className="flex">
                                        <button
                                                id="syncplay-btn"
                                                className="flex button ml-4"
                                                onClick={() =>
                                                        console.log(
                                                                "SyncPlay button clicked - placeholder for future implementation"
                                                        )
                                                }
                                        >
                                                <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 mr-2"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                >
                                                        <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                </svg>
                                                SyncPlay
                                        </button>
                                </div>
                        </div>
                        <Outlet />
                </div>
        );
}

export default App;
