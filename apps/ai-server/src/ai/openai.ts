import OpenAI from "openai"

const apiKey = process.env.OPENAI_API_KEY || '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'

export const openai = new OpenAI({
    apiKey: apiKey,
})