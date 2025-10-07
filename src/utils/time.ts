export const toTimerFormat = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString();
  const secs = Math.floor(seconds % 60);
  const secsStr = secs <= 9 ? `0${secs}` : `${secs}`;
  return `${mins}:${secsStr}`;
};
