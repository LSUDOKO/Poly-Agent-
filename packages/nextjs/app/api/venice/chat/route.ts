import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getVeniceClient() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: "https://api.venice.ai/api/v1",
  });
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `You are PolyPay's AI assistant. Help users with:
1. Understanding multisig wallets and transactions
2. Explaining ZK privacy features (signer identities hidden, only relayer on-chain)
3. Navigating the PolyPay platform
4. Gas optimization tips for Base, Arbitrum, and Horizen
5. x402 gasless USDC deposits

Be concise, accurate, and helpful. PolyPay is a privacy-preserving payroll & multisig platform.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const venice = getVeniceClient();
    if (!venice) {
      return NextResponse.json({ error: "Venice AI not configured - missing VENICE_API_KEY" }, { status: 503 });
    }

    const completion = await venice.chat.completions.create({
      model: "zai-org-glm-5-1",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ response });
  } catch (err) {
    console.error("Venice AI error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
