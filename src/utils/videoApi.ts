import type { UserSession } from "../types/video.ts";

export const reportSession = async (session: UserSession): Promise<void> => {
  const response = await fetch("/api/session/Session", {
    method: "POST",
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    console.log(await response.text());
  }
};

export const killSession = async (session: UserSession): Promise<void> => {
  const response = await fetch("/api/session/Killed", {
    method: "POST",
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    console.log(await response.text());
  }
};

export const reportPlaying = async (playing: boolean): Promise<void> => {
  const endpoint = playing ? "/api/session/Playing" : "/api/session/Stopped";
  const response = await fetch(endpoint);

  if (!response.ok) {
    console.log(await response.text());
  }
};

export const getPlayerInfo = async (): Promise<UserSession | null> => {
  const response = await fetch("/api/session/Playback")

  if (response.ok) {
    return response.json() as Promise<UserSession>
  }

  return null

}
