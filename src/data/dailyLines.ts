/**
 * "One line for today" (§Phase C). A single warm, affirmation-style line on Home
 * that rotates by the day — gentle and steady, never instructive, never a task or
 * a streak. Rotation is local and deterministic (day of year), so it's the same
 * all day and quietly changes tomorrow.
 */
export const DAILY_LINES: string[] = [
  'You are allowed to take up space here.',
  'Nothing is required of you right now.',
  'However you arrived today is okay.',
  'You can set it down for a moment.',
  'This breath is yours to keep.',
  'You don’t have to hold it all at once.',
  'Being here is enough.',
  'Softness is not the same as weakness.',
  'You are welcome, exactly as you are.',
  'Let this be a small, quiet mercy.',
  'There is time. You have time.',
  'You can come back to yourself, gently.',
  'Rest is not something you have to earn.',
  'Whatever today holds, you are not alone in it.',
];

/** Today's line — deterministic by day of year, stable for the whole day. */
export function dailyLine(d: Date = new Date()): string {
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  return DAILY_LINES[dayOfYear % DAILY_LINES.length];
}
