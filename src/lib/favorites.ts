// src/lib/favorites.ts

import type { Recipe } from "@/components/recipe-grid";

const STORAGE_KEY = "favoriteRecipes";
type Listener = (count: number) => void;
const listeners = new Set<Listener>();

export function getFavorites(): Recipe[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favs: Recipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function isFavorite(id: number): boolean {
  return getFavorites().some((r) => r.id === id);
}

export function toggleFavorite(recipe: Recipe) {
  const favs = getFavorites();
  const exists = favs.find((r) => r.id === recipe.id);
  const updated = exists
    ? favs.filter((r) => r.id !== recipe.id)
    : [...favs, recipe];
  saveFavorites(updated);
  notify(updated.length);
}

export function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  cb(getFavorites().length);
  return () => {
    listeners.delete(cb);
  };
}

function notify(count: number) {
  listeners.forEach((listener) => {
    try {
      listener(count);
    } catch (e) {
      console.error('Error in favorites listener:', e);
    }
  });
  
  try {
    window.dispatchEvent(new Event('favoritesUpdated'));
  } catch (e) {
  }
}
