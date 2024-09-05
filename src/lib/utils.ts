import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPercentage(value: number, total: number): number {
  return (value / total) * 100;
}

export function unformatTimestamp(duration: string) {
  const splittedDuration = duration.split(":");

  const hours = splittedDuration.length === 2 ? undefined : splittedDuration[0];
  const minutes =
    hours === undefined ? splittedDuration[0] : splittedDuration[1];
  const seconds =
    hours === undefined ? splittedDuration[1] : splittedDuration[2];
  if (hours === undefined && minutes === "0") {
    return Number.parseInt(seconds);
  }
  if (minutes !== undefined && hours === undefined) {
    const calcSeconds =
      Number.parseInt(minutes) * 60 + Number.parseInt(seconds);
    return calcSeconds;
  }
  if (hours !== undefined) {
    const calcSeconds =
      Number.parseInt(hours) * 3600 +
      Number.parseInt(minutes) * 60 +
      Number.parseInt(seconds);
    return calcSeconds;
  }
}

export function getFrameRateFromString(framerate: string): number {
  const [numerator, denominator] = framerate.split("/").map(Number);
  const frameRate = numerator / denominator;
  return frameRate;
}

export function getNextFrame(
  currentFrame: number,
  frameRate: number,
  duration: number,
): number {
  const nextFrame = currentFrame + frameRate;
  if (nextFrame > duration) {
    return duration;
  }
  return nextFrame;
}

// convert a number to a 00:00:00.000 format
export function formatTimestamp(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toFixed(3).padStart(6, "0")}`;
}
