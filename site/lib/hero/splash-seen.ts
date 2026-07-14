const KEY = "dw:splash-seen";

export function hasSeenSplash(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markSplashSeen(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* private mode / disabled — splash just shows again, acceptable */
  }
}
