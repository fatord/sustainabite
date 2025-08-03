"use client";

import { useState } from "react";
import { Loader2, Clock, Users, Utensils, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Recipe } from "./recipe-grid";

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

export default function RecipeCardDetails({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<GeminiRecipeDetails | null>(null);
  const [error, setError] = useState("");

  const handleToggle = async () => {
    if (!open && !details && !loading) {
      setLoading(true);
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe }),
        });
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        setError("Failed to load details.");
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  return (
    <div className="w-full space-y-4">
      <Button
        size="lg"
        onClick={handleToggle}
        className="w-full bg-primary text-primary-foreground hover:brightness-110"
      >
        {open ? "Hide Recipe Details" : "View Recipe Details"}
      </Button>

      {open && (
        <div className="border border-border rounded-xl p-4 bg-muted text-muted-foreground space-y-4 text-sm">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading recipe info...
            </div>
          )}

          {error && <div>{error}</div>}

          {details && (
            <>
              <div className="text-base text-text-primary">{details.description}</div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {recipe.readyInMinutes} mins
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {recipe.servings} servings
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  {details.difficulty || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {details.cuisineType || "N/A"}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-1">Ingredients</h4>
                <ul className="list-disc pl-4">
                  {details.ingredients?.slice(0, 10).map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-1">Steps</h4>
                <ol className="list-decimal pl-4">
                  {details.prepSteps?.slice(0, 4).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-1">Nutrition (per serving)</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="font-medium text-text-primary">
                      {details.nutrition?.calories || "-"}
                    </div>
                    <div className="text-xs">cal</div>
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">
                      {details.nutrition?.protein || "-"}g
                    </div>
                    <div className="text-xs">protein</div>
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">
                      {details.nutrition?.fat || "-"}g
                    </div>
                    <div className="text-xs">fat</div>
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">
                      {details.nutrition?.carbs || "-"}g
                    </div>
                    <div className="text-xs">carbs</div>
                  </div>
                </div>
              </div>

              {details.dietaryInfo && details.dietaryInfo.length > 0 && (
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {details.dietaryInfo.map((tag, i) => (
                     <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                   ))}
                  </div>
                </div>
              )}

              {details.tips && details.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Tips</h4>
                  <ul className="list-disc pl-4">
                    {details.tips.slice(0, 3).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <a
            href={`https://spoonacular.com/recipes/${recipe.title
              .replace(/\s+/g, "-")
              .toLowerCase()}-${recipe.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center text-primary hover:underline"
          >
            View full recipe details
          </a>
        </div>
      )}
    </div>
  );
}
