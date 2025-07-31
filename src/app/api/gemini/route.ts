import { NextRequest, NextResponse } from 'next/server';

const GEMINI_KEY = process.env.GEMINI_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(request: NextRequest) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: 'Missing GEMINI_KEY' }, { status: 500 });
  }

  try {
    const { recipe } = await request.json();

    const prompt = `
Recipe Name: ${recipe.title}

Please respond ONLY in minified JSON with these fields:
description (string),
difficulty (string),
cuisineType (string),
ingredients (array of strings),
prepSteps (array of strings),
nutrition (calories, protein, fat, carbs as numbers),
dietaryInfo (array of strings like "glutenFree", "vegan"),
tips (array of strings)
`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: 'No response from Gemini', raw: json }, { status: 500 });
    }

    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsed = JSON.parse(cleaned);

    const normalized = {
      description: parsed.description || '',
      difficulty: parsed.difficulty || 'N/A',
      cuisineType: parsed.cuisineType || 'N/A',
      ingredients: (parsed.ingredients || []).map((item: any) =>
        typeof item === 'string' ? item : `${item.amount} ${item.item}`.trim()
      ),
      prepSteps: parsed.prepSteps || [],
      nutrition: {
        calories: parseInt(parsed.nutrition?.calories) || 0,
        protein: parseInt(parsed.nutrition?.protein) || 0,
        fat: parseInt(parsed.nutrition?.fat) || 0,
        carbs: parseInt(parsed.nutrition?.carbs) || 0
      },
      dietaryInfo: Array.isArray(parsed.dietaryInfo)
        ? parsed.dietaryInfo
        : Object.keys(parsed.dietaryInfo || {}).filter((key) => parsed.dietaryInfo[key]),
      tips: parsed.tips || []
    };

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error('Gemini route error:', err);
    return NextResponse.json(
      {
        error: 'Gemini fetch failed',
        detail: err.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
