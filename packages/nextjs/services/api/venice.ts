import OpenAI from "openai";

const VENICE_API_KEY = process.env.NEXT_PUBLIC_VENICE_API_KEY || "";

export const veniceClient = new OpenAI({
  apiKey: VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export interface VeniceChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function veniceChat(messages: VeniceChatMessage[], model: string = "zai-org-glm-5-1") {
  const response = await veniceClient.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "";
}

export async function veniceChatWithTools(
  messages: VeniceChatMessage[],
  tools: OpenAI.Chat.Completions.ChatCompletionTool[],
  model: string = "zai-org-glm-5-1",
) {
  const response = await veniceClient.chat.completions.create({
    model,
    messages,
    tools,
    tool_choice: "auto",
    temperature: 0.7,
  });

  return response.choices[0]?.message;
}

const TRANSACTION_ANALYSIS_SYSTEM_PROMPT = `You are a blockchain transaction analyst for PolyPay, a privacy-preserving payroll and multisig platform. Help users understand transactions, suggest optimal gas strategies, and explain onchain operations. Be concise and accurate.`;

const AGENT_ASSISTANT_SYSTEM_PROMPT = `You are PolyPay's AI assistant. You help users with:
1. Understanding their multisig wallet and transactions
2. Explaining ZK privacy features
3. Navigating the platform
4. Gas optimization tips
5. General crypto/payroll advice

Be helpful, concise, and accurate.`;

export async function analyzeTransaction(txData: string, chainName: string): Promise<string> {
  return veniceChat([
    { role: "system", content: TRANSACTION_ANALYSIS_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Analyze this transaction on ${chainName}:\n${txData}\n\nExplain what it does, the gas cost implications, and any security considerations.`,
    },
  ]);
}

export async function getAIAssistantResponse(userMessage: string, context?: string): Promise<string> {
  const messages: VeniceChatMessage[] = [{ role: "system", content: AGENT_ASSISTANT_SYSTEM_PROMPT }];

  if (context) {
    messages.push({
      role: "system",
      content: `Current context: ${context}`,
    });
  }

  messages.push({ role: "user", content: userMessage });
  return veniceChat(messages);
}
