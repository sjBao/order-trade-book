import type { Coin } from "@/domain/types";
import { createStore, useStore } from "./createStore";

export const selectedCoinStore = createStore<Coin>();

export const useSelectedCoin = () => useStore(selectedCoinStore);
