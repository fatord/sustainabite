"use client";

import { useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { Recipe } from "@/components/recipe-grid";
import AppNavbar from "@/components/app-navbar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Clock, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { RecipeTooltip } from "@/components/recipe-tooltip";
import { AICoach } from "@/components/ai-coach";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());

    const handleStorageChange = () => setFavorites(getFavorites());
    const handleCustomEvent = () => setFavorites(getFavorites());

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favoritesUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favoritesUpdated", handleCustomEvent);
    };
  }, []);

  const handleRemoveFavorite = (recipe: Recipe) => {
    toggleFavorite(recipe);
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--color-background-secondary)] text-[var(--color-text-primary)] relative overflow-hidden">
      <AppNavbar />

      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full filter blur-3xl opacity-70 -z-10" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full filter blur-3xl opacity-70 -z-10" />
      <div className="absolute top-2/3 left-1/4 w-72 h-72 bg-[var(--primary)]/5 rounded-full filter blur-3xl opacity-70 -z-10" />

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl mb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl">
            Your Favorite Recipes
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--color-text-secondary)]">
            {favorites.length > 0
              ? `You have ${favorites.length} saved ${favorites.length === 1 ? "recipe" : "recipes"}.`
              : "You haven't saved any recipes yet."}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex justify-center items-center p-4 bg-[var(--muted)] rounded-full mb-4">
              <Heart className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
              Browse recipes and click the heart icon or "Save" button to add them to your favorites.
            </p>
            <Button className="mt-6" asChild>
              <a href="/">Discover Recipes</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <RecipeTooltip recipe={recipe}>
                  <Card className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                    
                    <button
                      onClick={() => handleRemoveFavorite(recipe)}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur shadow-md"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>

                    <div className="relative h-52 w-full">
                      <Image
                        src={recipe.image.replace(/-\d+x\d+\.jpg$/, "-636x393.jpg")}
                        alt={`Image of ${recipe.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex-1">
                        <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                          {recipe.title}
                        </h3>
                        <div className="mt-3 flex items-center space-x-6 text-sm text-[var(--color-text-secondary)]">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{recipe.readyInMinutes} mins</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{recipe.servings} servings</span>
                          </div>
                        </div>
                      </div>

                      <CardFooter className="mt-6 p-0 pt-6 flex flex-col sm:flex-row gap-3">
                        <Button
                          size="lg"
                          className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110"
                          asChild
                        >
                          <a
                            href={`https://spoonacular.com/recipes/${recipe.title
                              .replace(/\s+/g, "-")
                              .toLowerCase()}-${recipe.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Recipe
                          </a>
                        </Button>
                      </CardFooter>
                    </div>
                  </Card>
                </RecipeTooltip>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AICoach />
    </div>
  );
}
