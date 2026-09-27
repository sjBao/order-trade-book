import type { Book } from "@/domain/types";
import { createStore, useStore } from "./createStore";

export const bookStore = createStore<Book>();

export const useBook = () => useStore(bookStore);
