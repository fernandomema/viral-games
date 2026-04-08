// Shared state to enable view-transition hero animation on back navigation
let _id = '';
export function setActiveGame(id: string) { _id = id; }
export function getActiveGame() { return _id; }
export function clearActiveGame() { _id = ''; }
