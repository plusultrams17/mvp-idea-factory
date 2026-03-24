import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が .env.local に設定されていません" },
      { status: 500 }
    );
  }

  const { prompt } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 16384,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `OpenAI API error: ${res.status} ${err}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";

  // Check if response was truncated
  const finishReason = data.choices?.[0]?.finish_reason;
  if (finishReason === "length") {
    return NextResponse.json(
      { error: "レスポンスが長すぎて途中で切れました。生成数を減らして再試行してください。" },
      { status: 422 }
    );
  }

  return NextResponse.json({
    content: [{ text }],
  });
}
