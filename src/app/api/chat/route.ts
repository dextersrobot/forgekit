import { streamText, type Message } from "ai";
import { requireContext } from "@/lib/auth";
import { getChatModel } from "@/lib/ai/provider";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 60;

const BASE_SYSTEM = `You are a helpful assistant for this workspace.
Be concise and accurate.`;

export async function POST(req: Request) {
  try {
    const ctx = await requireContext();
    await assertWithinLimits(ctx.owner);

    const { messages } = (await req.json()) as { messages: Message[] };

    const result = streamText({
      model: getChatModel(),
      system: BASE_SYSTEM,
      messages,
      onFinish: async ({ usage }) => {
        const total =
          (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0);
        await recordUsage(ctx.owner, ctx.userId, "chat_tokens", total).catch(
          console.error,
        );
      },
    });

    return result.toDataStreamResponse();
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return Response.json({ error: (e as Error).message }, { status });
  }
}
