export function render(): string {
  return `
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">About</h1>
          <p class="py-6">
            Cornershop Media Player is a modern web-based media streaming application 
            built with TypeScript and Vite. It supports HLS streaming and is designed 
            for synchronized playback experiences.
          </p>
          <a href="/" class="btn btn-primary">Back to Player</a>
        </div>
      </div>
    </div>
  `;
}