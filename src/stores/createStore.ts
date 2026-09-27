import { useSyncExternalStore } from "react";

export type Store<T> = {
	getSnapshot(): T | null;
	reset(): void;
	set(value: T): void;
	subscribe(listener: () => void): () => void;
};
export function createStore<T>(): Store<T> {
	const listeners = new Set<() => void>();
	// used to capture every incoming values even if they occur between frames
	let latest: T | null = null;
	// used to hold the current animation frame's value
	let snapshot: T | null = null;
	let frame: number | null = null;

	function notify() {
		listeners.forEach((listener) => listener());
	}

	function publish() {
		frame = null;
		snapshot = latest;
		notify();
	}

	function schedulePublish() {
		frame ??= requestAnimationFrame(publish);
	}

	return {
		getSnapshot: () => snapshot,

		reset() {
			if (frame !== null) cancelAnimationFrame(frame);
			frame = null;
			latest = null;
			const hadSnapshot = snapshot !== null;
			snapshot = null;

			// Update listeners now, instead of waiting for the next frame from incoming message
			if (hadSnapshot) notify();
		},

		set(value: T) {
			latest = value;
			schedulePublish();
		},

		subscribe(listener) {
			listeners.add(listener);

			return () => listeners.delete(listener);
		},
	};
}

export function useStore<T>(store: Store<T>): T | null {
	return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
