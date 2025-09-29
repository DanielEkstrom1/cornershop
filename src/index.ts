import { html, setupVideo } from "./video.ts";

export function render(): string {
  return `
    <div class="container mx-auto p-4">
      ${html()}
    </div>
  `;
}

export function setup(): void {
  setupVideo(document.querySelector<HTMLVideoElement>("#video")!);
}