/**
 * Companion flows (§Phase A). One content config drives a single reusable flow
 * engine: tapping a disease or feeling tile in Support enters that flow. Disease
 * flows run 4 screens, feeling flows run 3 (lighter, quicker).
 *
 * Voice: companionship, never causation. The app never says a disease or feeling
 * is caused by anything, and never claims a practice treats or cures. It only
 * offers where weight tends to sit now, and helps tend to it.
 */
export type FlowKind = 'disease' | 'feeling';

export type BodyAnchor =
  | 'head'
  | 'throat'
  | 'chest'
  | 'solarPlexus'
  | 'belly'
  | 'sacral'
  | 'lowerBack'
  | 'hands'
  | 'whole';

export interface FlowPractice {
  title: string;
  minutes: number;
  track: string; // a calm-track name; flowTrackSrc() maps it to a file in public/audio
  intro: string;
}

export interface FlowEntry {
  id: string; // matches the Support tile id (feeling.id / disease flow id) so the tile can launch it
  kind: FlowKind;
  title: string;
  affirmation: string; // screen 1
  anchor: BodyAnchor; // screen 2 glow point
  locate: string; // screen 2 body-awareness and release copy
  practice: FlowPractice;
  closeLighter: string; // shown when check-in is "Lighter" or "A little"
  closeHeavy: string; // shown when check-in is "Still heavy, and that's okay"
}

/** Shared close-screen check-in options. The check-in cannot be failed — every
 *  option lands soft. Used by both flows. */
export const CHECK_IN = [
  { id: 'lighter', label: 'Lighter' },
  { id: 'a-little', label: 'A little' },
  { id: 'still-heavy', label: "Still heavy, and that's okay" },
] as const;

export const DISEASE_FLOWS: FlowEntry[] = [
  {
    id: 'cancer',
    kind: 'disease',
    title: 'Cancer',
    affirmation: "You carry more than most people ever see. Tonight, you don't have to carry it alone.",
    anchor: 'chest',
    locate: "Let whatever feels heaviest come to rest right here, in the centre of your chest. You don't have to fight it for the next few minutes. Just let it be held.",
    practice: { title: 'Resting the weight', minutes: 10, track: 'warm-ambient', intro: "Ten slow minutes, just for you. Breathe, and let the sound carry some of it." },
    closeLighter: "Stay as long as you like. This quiet is yours, and it's here whenever you need it.",
    closeHeavy: "Some weight takes its own time. You came here and you stayed, and that counts more than you know.",
  },
  {
    id: 'dialysis',
    kind: 'disease',
    title: 'Dialysis',
    affirmation: "Your body is working hard, and so are you. Let this be the part of the day that asks nothing of you.",
    anchor: 'lowerBack',
    locate: "Bring your attention low in your back, where your body quietly does its work. Soften there. Let it be looked after for a while.",
    practice: { title: 'Letting the body rest', minutes: 10, track: 'deep-calm', intro: "Settle in. Nothing to do here but breathe." },
    closeLighter: "Carry this softness with you. Come back whenever the day feels like too much.",
    closeHeavy: "That's alright. You gave yourself this time, and that was the whole point.",
  },
  {
    id: 'digestion',
    kind: 'disease',
    title: 'Digestion Problems',
    affirmation: "It's okay to slow down. Some things only settle when we stop holding them so tight.",
    anchor: 'belly',
    locate: "Rest a hand over your belly if you'd like. Let it rise and fall. Let whatever is knotted there begin to loosen on its own.",
    practice: { title: 'Softening the middle', minutes: 8, track: 'gentle-flow', intro: "Eight minutes of slow breathing. Let your belly lead." },
    closeLighter: "Keep breathing low and slow through the day. It helps more than it seems.",
    closeHeavy: "No rush. You showed up for yourself, and you can come back anytime.",
  },
  {
    id: 'breathing',
    kind: 'disease',
    title: 'Breathing Problems',
    affirmation: "Every breath you take is enough. You don't need to reach for the next one yet.",
    anchor: 'chest',
    locate: "Feel the space in your chest, just as it is right now. We are not going to force anything. We are only going to make a little more room.",
    practice: { title: 'Making room to breathe', minutes: 8, track: 'airy-calm', intro: "Follow the rhythm gently. Let each breath be easy." },
    closeLighter: "That ease is always within reach. Return to it whenever you need.",
    closeHeavy: "That's completely okay. Being here, breathing slowly, is already a kindness to yourself.",
  },
  {
    id: 'skin',
    kind: 'disease',
    title: 'Skin Treatment',
    affirmation: "You are more than what shows on the surface. Tonight, let all of you be at ease.",
    anchor: 'whole',
    locate: "Let a soft warmth settle over your whole body, like being wrapped in something kind. Nothing to hide, nothing to fix.",
    practice: { title: 'A softer stillness', minutes: 8, track: 'warm-ambient', intro: "Let the warmth spread slowly as you breathe." },
    closeLighter: "Carry that gentleness with you. You deserve it.",
    closeHeavy: "That's alright. You gave yourself a moment of ease, and that stays with you.",
  },
  {
    id: 'sexual',
    kind: 'disease',
    title: 'Sexual Problems',
    affirmation: "This part of you deserves patience, not pressure. Let's set the pressure down for a while.",
    anchor: 'sacral',
    locate: "Bring a gentle attention low in your body, without judgment. Let it soften. There is nothing here to prove.",
    practice: { title: 'Releasing the pressure', minutes: 8, track: 'deep-calm', intro: "Breathe slowly. Let go of any effort to be anything at all." },
    closeLighter: "Let this ease stay with you. Kindness toward yourself is the whole practice.",
    closeHeavy: "That's okay. You met yourself with patience tonight, and that matters.",
  },
  {
    id: 'joint',
    kind: 'disease',
    title: 'Joint Problems',
    affirmation: "Your body has carried you through so much. Let's give it a little care in return.",
    anchor: 'hands',
    locate: "Notice where your body feels tight or worn. Breathe toward it, softly, the way you would tend to someone you love.",
    practice: { title: 'Easing the tension', minutes: 8, track: 'gentle-flow', intro: "Slow breath, soft attention. Let the tightness loosen at its own pace." },
    closeLighter: "Move gently through your day. Your body will thank you for the care.",
    closeHeavy: "No pressure at all. You paused for yourself, and that was worth it.",
  },
  {
    id: 'psychological',
    kind: 'disease',
    title: 'Psychological Issues',
    affirmation: "Whatever you're holding, it makes sense that it feels heavy. You're allowed to set it down here.",
    anchor: 'head',
    locate: "Let your thoughts be as loud or as quiet as they are. We are not going to argue with them. We are just going to sit beside them for a while.",
    practice: { title: 'A quiet place to rest', minutes: 10, track: 'deep-calm', intro: "Ten slow minutes. Let the noise settle like dust in still air." },
    closeLighter: "Come back to this quiet whenever your mind feels crowded. It's always here.",
    closeHeavy: "That's okay. Heavy days are still days you got through. Be gentle with yourself tonight.",
  },
];

export const FEELING_FLOWS: FlowEntry[] = [
  {
    id: 'stress',
    kind: 'feeling',
    title: 'Stress',
    affirmation: "Whatever is coming, you don't have to hold all of it at once. Right now, there is only this breath.",
    anchor: 'head',
    locate: "Stress likes to gather up here, behind the eyes and across the forehead. Let it loosen. You can pick your thinking back up in five minutes.",
    practice: { title: 'Letting the head go quiet', minutes: 5, track: 'calm-focus', intro: "Five minutes. Let each breath out take a little of the tension with it." },
    closeLighter: "Go gently into what's next. You have more room now than you did.",
    closeHeavy: "That's fine. Even a few slow breaths changed something. Take them with you.",
  },
  {
    id: 'afraid',
    kind: 'feeling',
    title: 'Afraid',
    affirmation: "Fear is just your mind trying to keep you safe. You can thank it, and still let it rest.",
    anchor: 'belly',
    locate: "Fear often sits low in the belly, tight and quick. Breathe down into it slowly. Let it know it's okay to loosen.",
    practice: { title: 'Softening the fear', minutes: 5, track: 'grounding', intro: "Slow breaths, all the way down. You are safe in this moment." },
    closeLighter: "Carry that steadiness with you. It was there all along.",
    closeHeavy: "That's okay. You faced it instead of running, and that's its own kind of brave.",
  },
  {
    id: 'depressed',
    kind: 'feeling',
    title: 'Depressed',
    affirmation: "You don't have to feel better to be worthy of rest. Being here is already enough.",
    anchor: 'chest',
    locate: "There's a heaviness that likes to settle in the chest. You don't have to lift it. Just let it be held for a little while.",
    practice: { title: 'Sitting with the heaviness', minutes: 5, track: 'warm-ambient', intro: "Nothing to achieve here. Just breathe, and let yourself be." },
    closeLighter: "Small lifts count. Let this one stay with you a while.",
    closeHeavy: "That's completely okay. You showed up, and on some days that's everything.",
  },
  {
    id: 'angry',
    kind: 'feeling',
    title: 'Angry',
    affirmation: "Anger usually means something mattered to you. You can honour that, and still let the heat cool.",
    anchor: 'solarPlexus',
    locate: "Feel the heat gathering, often around the chest and stomach. Breathe into it slowly. Let it move through instead of staying stuck.",
    practice: { title: 'Letting the heat pass', minutes: 5, track: 'grounding', intro: "Long, slow breaths out. Let each one cool the edge a little." },
    closeLighter: "Carry that cooler head with you. Nothing needs deciding right now.",
    closeHeavy: "That's alright. You gave it somewhere to go instead of holding it in. That helps.",
  },
  {
    id: 'sleep-deprived',
    kind: 'feeling',
    title: 'Sleep Deprived',
    affirmation: "You don't have to chase sleep. You only have to let yourself rest, and that can start now.",
    anchor: 'head',
    locate: "Let your eyes feel heavy. Let your face go slack. There is nowhere to be and nothing to solve for the next few minutes.",
    practice: { title: 'Winding down', minutes: 5, track: 'night-drift', intro: "Let everything grow quiet. Sleep comes easier when we stop reaching for it." },
    closeLighter: "Carry this stillness toward your night. Let rest find you.",
    closeHeavy: "That's okay. Even resting your eyes for a few minutes gives something back.",
  },
  {
    id: 'overwhelmed',
    kind: 'feeling',
    title: 'Overwhelmed',
    affirmation: "Everything at once is too much for anyone. For now, there is only one thing: this breath.",
    anchor: 'chest',
    locate: "When it's all too much, the chest tightens and the mind races. Let's slow both down together, one breath at a time.",
    practice: { title: 'One thing at a time', minutes: 5, track: 'calm-focus', intro: "Just breathe with the rhythm. The list can wait five minutes." },
    closeLighter: "Take it one step from here. You have more space than a moment ago.",
    closeHeavy: "That's okay. You stepped out of the rush for a moment, and you can do that again anytime.",
  },
];

export const ALL_FLOWS = [...DISEASE_FLOWS, ...FEELING_FLOWS];
export const getFlowById = (id: string) => ALL_FLOWS.find((f) => f.id === id);

/**
 * Resolve a practice `track` name to a real asset in public/audio (sleep.ts
 * pattern). None of these calm-track names have a final recording yet, so each
 * maps to the closest existing calm file; a real session track is the safe
 * fallback so a flow never points at a missing file.
 * TODO: replace with final audio
 */
const TRACK_SRC: Record<string, string> = {
  'warm-ambient': '/audio/astral.mp3',
  'deep-calm': '/audio/delta-waves.mp3',
  'gentle-flow': '/audio/flute.mp3',
  'airy-calm': '/audio/singing-bowl.mp3',
  'calm-focus': '/audio/binaural.mp3',
  grounding: '/audio/om.mp3',
  'night-drift': '/audio/solfeggio.mp3',
};
export const flowTrackSrc = (track: string): string => TRACK_SRC[track] ?? '/audio/track.mp3';
