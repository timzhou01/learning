
import { setInterval } from "node:timers/promises"

export async function runWithHeartbeat<T>(
    task: () => Promise<T>,
    renew: () => Promise<boolean>,
): Promise<T> {
    const controller = new AbortController()

    const heartbeat = (async () => {
        try {
            for await (const _ of setInterval(20_000, undefined, {
                signal: controller.signal,
            })) {
                const renewed = await renew()

                if (!renewed) {
                    controller.abort()
                    break
                }
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                controller.abort()
                throw error
            }
        }
    })()

    try {
        return await task()
    } finally {
        controller.abort()
        await heartbeat
    }
}
