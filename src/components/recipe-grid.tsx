"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Clock, Users, CheckCircle2, XCircle } from "lucide-react";
import { toggleFavorite, isFavorite } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import RecipeCardDetails from "@/components/recipe-card-details";

interface Ingredient {
  name: string;
  isAvailable?: boolean;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredients: Ingredient[];
  missedIngredients: Ingredient[];
  diets?: string[];
  readyInMinutes: number;
  servings: number;
}

interface Props {
  searchState: {
    ingredients: string[];
    filters: Record<string, boolean>;
  };
  setLatestRecipes?: (recipes: Recipe[]) => void;
  featuredRecipe?: Recipe | null;
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "")
    .replace(/(es|s)$/, "");
}

function isIngredientMatch(inputList: string[], ingredientName: string) {
  const norm = normalize(ingredientName);
  return inputList.some((input) => {
    const ni = normalize(input);
    return norm.includes(ni) || ni.includes(norm);
  });
}

export default function RecipeGrid({
  searchState,
  setLatestRecipes,
  featuredRecipe,
}: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { ingredients, filters } = searchState;
      if (!ingredients.length) return;
      setLoading(true);
      setApiError(false);
      try {
        const diets = Object.entries(filters)
          .filter(([_, enabled]) => enabled)
          .map(([diet]) => diet);

        const body = { ingredients, diets };

        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          setApiError(true);
          return;
        }

        const data: Recipe[] = await res.json();

        if (!data || !Array.isArray(data)) {
          setApiError(true);
          return;
        }

        setRecipes(data);
        setLatestRecipes?.(data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchState, setLatestRecipes]);

  const renderCard = (recipe: Recipe, index: number) => (
    <motion.div
      key={recipe.id}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <button
        onClick={() => {
          toggleFavorite(recipe);
          setRecipes([...recipes]);
        }}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-white"
        aria-label={isFavorite(recipe.id) ? "Unfavorite" : "Favorite"}
      >
        <Heart
          className={`h-6 w-6 transition-colors ${
            isFavorite(recipe.id) ? "text-red-500 fill-current" : "text-gray-500"
          }`}
        />
      </button>
      <Card className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
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
            <h3 className="font-display text-2xl font-bold text-text-primary tracking-tight">
              {recipe.title}
            </h3>
            <div className="mt-3 flex items-center space-x-6 text-sm text-text-secondary">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{recipe.readyInMinutes} mins</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-display text-base font-semibold text-text-primary">
                Key Ingredients
              </h4>
              <ul className="mt-3 space-y-2.5">
                {recipe.usedIngredients
                  .concat(recipe.missedIngredients)
                  .slice(0, 5)
                  .map((ingredient) => {
                    const match = isIngredientMatch(searchState.ingredients, ingredient.name);
                    return (
                      <li key={ingredient.name} className="flex items-center text-sm">
                        {match ? (
                          <CheckCircle2 className="mr-2.5 h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="mr-2.5 h-5 w-5 text-destructive" />
                        )}
                        <span className="text-muted-foreground">{ingredient.name}</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
          <CardFooter className="mt-6 p-0 pt-6">
            <RecipeCardDetails recipe={recipe} />
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );

  const bestMatch =
    recipes.length > 0
      ? recipes.reduce((prev, curr) => {
          const pm = prev.missedIngredients.length;
          const cm = curr.missedIngredients.length;
          const pu = prev.usedIngredients.length;
          const cu = curr.usedIngredients.length;
          if (cm < pm) return curr;
          if (cm === pm && cu > pu) return curr;
          return prev;
        }, recipes[0])
      : null;

  return (
    <section className="bg-background-secondary py-20 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Recipes You Can Make
          </h2>
          <p className="mt-4 text-lg leading-8 text-text-secondary">
            {recipes.length > 0
              ? `Found ${recipes.length} recipes based on your ingredients.`
              : searchState.ingredients.length > 0
              ? "Searching for recipes based on your ingredients..."
              : "Add ingredients to find matching recipes."}
          </p>
        </div>

        {loading && (
          <p className="mt-10 text-center text-text-muted">Loading recipes...</p>
        )}

        {apiError && (
          <div className="mt-10 text-center text-red-500 text-sm">
            API limit may have been reached or the request timed out. We apologize for the inconvenience.
          </div>
        )}

        {featuredRecipe && (
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-text-primary mb-6 text-center">
              Surprise Pick
            </h3>
            {renderCard(featuredRecipe, 0)}
          </div>
        )}

        {!featuredRecipe && bestMatch && recipes.length > 0 && (
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-text-primary mb-6 text-center">
              Best Match
            </h3>
            {renderCard(bestMatch, 0)}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {recipes
              .filter((r) => r.id !== bestMatch?.id && r.id !== featuredRecipe?.id)
              .map((recipe, i) => renderCard(recipe, i + 1))}
          </div>
        )}

        {recipes.length === 0 && !loading && searchState.ingredients.length > 0 && !apiError && (
          <div className="mt-16 text-center">
            <p className="text-lg text-text-secondary">
              No recipes found with your current ingredients or filters. Try adding more
              ingredients or changing your filters.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
