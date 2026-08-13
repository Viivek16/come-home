/**
 * Crisis-support resources (§6.6). Placeholder + data-driven — reads as a neutral
 * placeholder, never a medical claim (§15). Real numbers/links drop in here later.
 */
export type Resource = { id: string; label: string; detail: string; href?: string };

export const CRISIS_RESOURCES: Resource[] = [
  { id: 'talk', label: 'Talk to someone now', detail: 'Placeholder — a crisis line will be listed here.' },
  { id: 'text', label: 'Text support', detail: 'Placeholder — a text support line will be listed here.' },
  { id: 'local', label: 'Find local help', detail: 'Placeholder — local resources will be listed here.' },
];
