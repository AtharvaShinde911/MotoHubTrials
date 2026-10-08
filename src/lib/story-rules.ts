/** Limits shared by the story form (client) and the server checks. */
export const MAX_PHOTOS = 4;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const STORY_LIMITS = { title: [5, 120], body: [20, 10000], vehicle: 80 } as const;
