import type { Status } from "@/domain/types";
import { createStore, useStore } from "./createStore";

export const statusStore = createStore<Status>();

export const useConnectionStatus = () => useStore(statusStore);

/** True whenever the socket isn't live: whatever the panels show has stopped updating. */
export const useIsStale = () => useConnectionStatus() !== "open";
