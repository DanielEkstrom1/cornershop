import { Link } from "react-router-dom";

function About() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">About</h1>
          <p className="py-6">
            Cornershop Media Player is a modern web-based media streaming application
            built with TypeScript and Vite. It supports HLS streaming and is designed
            for synchronized playback experiences.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Player
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
