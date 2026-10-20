
import { randomUUID } from "node:crypto"

export async function createChatCompletion(
    model: string,
    messages: Array<{
        role: "system" | "user" | "assistant"
        content: string
    }>,
) {
    // 模拟模型响应时间
    await new Promise(resolve => setTimeout(resolve, 200))

    const promptTokens = messages.reduce(
        (sum, message) => sum + Math.ceil(message.content.length / 4),
        0,
    )

    const completionTokens = 100

    return {
        id: `chatcmpl-${randomUUID()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: "This is a mock AI response.",
                },
                finish_reason: "stop",
            },
        ],
        usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens,
        },
    }
}
