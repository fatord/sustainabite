import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prompt =
    body?.recipe?.title ||
    body?.prompt ||
    "Suggest a sustainable recipe using available ingredients.";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await res.json();

    const reply =
      json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "Sorry, no suggestion could be generated.";

    return NextResponse.json({
      response: reply,
      raw: json,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gemini fetch failed", detail: err.message },
      { status: 500 }
    );
  }
}
