"use client";

import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Clock, Users, Scale, Utensils, Tag, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recipe } from "./recipe-grid";

interface RecipeTooltipProps {
  recipe: Recipe;
  children: React.ReactNode;
}

interface GeminiRecipeDetails {
  description?: string;
  difficulty?: string;
  cuisineType?: string;
  ingredients?: string[];
  prepSteps?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  dietaryInfo?: string[];
  tips?: string[];
}

export function RecipeTooltip({ recipe, children }: RecipeTooltipProps) {
  const [loading, setLoading] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState<GeminiRecipeDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // combine all ingredients for display
  const allIngredients = [
    ...recipe.usedIngredients,
    ...recipe.missedIngredients,
  ].slice(0, 8);

  const fallbackData = {
    totalTime: recipe.readyInMinutes,
    difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
    calories: Math.floor(Math.random() * 400) + 200,
    protein: Math.floor(Math.random() * 30) + 10,
    fat: Math.floor(Math.random() * 20) + 5,
    carbs: Math.floor(Math.random() * 50) + 20,
    cuisineType: [
      "Italian",
      "Mexican",
      "Asian",
      "American",
      "Mediterranean",
      "Indian",
    ][Math.floor(Math.random() * 6)],
    dietaryTags: recipe.diets || [],
  };
  
  // function to fetch recipe details
  const fetchRecipeDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch recipe details");
      }
      
      const data = await response.json();
      setRecipeDetails(data);
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      setError("Could not load enhanced recipe details");
    } finally {
      setLoading(false);
    }
  };
  
  // fetch only when tooltip is opened
  const handleTooltipOpen = () => {
    if (!recipeDetails && !loading && !error) {
      fetchRecipeDetails();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip onOpenChange={(open) => open && handleTooltipOpen()}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="w-96 p-0 overflow-hidden max-h-[80vh] overflow-y-auto"
        >
          <div className="bg-card text-card-foreground rounded-md overflow-hidden">
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-base">{recipe.title}</h3>
              
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm">Loading enhanced details...</span>
                </div>
              )}
              
              {error && (
                <div className="text-sm text-muted-foreground italic">
                  {error}. Using basic information instead.
                </div>
              )}
              
              {recipeDetails?.description && (
                <div className="text-sm text-muted-foreground">
                  {recipeDetails.description}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{recipe.readyInMinutes} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  <span>{recipeDetails?.difficulty || fallbackData.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>{recipeDetails?.cuisineType || fallbackData.cuisineType}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Ingredients:</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {recipeDetails?.ingredients ? (
                    recipeDetails.ingredients.slice(0, 8).map((ingredient, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span>•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))
                  ) : (
                    allIngredients.map((ingredient) => (
                      <li key={ingredient.name} className="flex items-center gap-1">
                        <span>•</span>
                        <span>{ingredient.name}</span>
                      </li>
                    ))
                  )}
                  {((recipeDetails?.ingredients && recipeDetails.ingredients.length > 8) || 
                    (!recipeDetails?.ingredients && allIngredients.length > 8)) && 
                    <li>• and more...</li>
                  }
                </ul>
              </div>
              
              {/* prep steps */}
              {recipeDetails?.prepSteps && recipeDetails.prepSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Preparation:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {recipeDetails.prepSteps.slice(0, 3).map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="mt-0.5">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                    {recipeDetails.prepSteps.length > 3 && (
                      <li className="text-xs italic">View full recipe for more steps...</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Nutrition (per serving):</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-1 bg-muted rounded">
                    <div className="font-medium">
                      {recipeDetails?.nutrition?.calories || fallbackData.calories}
                    </div>
                    <div className="text-muted-foreground">cal</div>
                  </div>
                  <div className="text-center p-1 bg-muted rounded">
                    <div className="font-medium">
                      {recipeDetails?.nutrition?.protein || fallbackData.protein}g
                    </div>
                    <div className="text-muted-foreground">protein</div>
                  </div>
                  <div className="text-center p-1 bg-muted rounded">
                    <div className="font-medium">
                      {recipeDetails?.nutrition?.fat || fallbackData.fat}g
                    </div>
                    <div className="text-muted-foreground">fat</div>
                  </div>
                  <div className="text-center p-1 bg-muted rounded">
                    <div className="font-medium">
                      {recipeDetails?.nutrition?.carbs || fallbackData.carbs}g
                    </div>
                    <div className="text-muted-foreground">carbs</div>
                  </div>
                </div>
              </div>

              {/* diet tags */}
              {(recipeDetails?.dietaryInfo?.length || recipe.diets?.length) ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Dietary:</h4>
                  <div className="flex flex-wrap gap-1">
                    {(recipeDetails?.dietaryInfo || recipe.diets || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {/* extra tips */}
              {recipeDetails?.tips && recipeDetails.tips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Tips:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {recipeDetails.tips.slice(0, 2).map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}