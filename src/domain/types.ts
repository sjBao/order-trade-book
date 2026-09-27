// offline: the browser reports no network, so we wait for it instead of retrying
export type Status =
	| "connecting"
	| "open"
	| "reconnecting"
	| "offline"
	| "closed";
