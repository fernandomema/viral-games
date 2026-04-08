import { WebHaptics } from 'web-haptics';

let instance: WebHaptics | null = null;

function get(): WebHaptics {
	if (!instance) instance = new WebHaptics();
	return instance;
}

export function haptic(preset: 'success' | 'nudge' | 'error' | 'buzz' = 'nudge') {
	get().trigger(preset);
}

export function hapticTap(ms = 40) {
	get().trigger(ms);
}
