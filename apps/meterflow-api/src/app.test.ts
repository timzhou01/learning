
import { describe, it, expect } from "vitest"
import request from "supertest"
import { app } from "./app.js"

describe("MeterFlow API", () => {
    it("GET /health returns healthy status", async () => {
        const response = await request(app)
            .get("/health")
            .expect(200)

        expect(response.body).toEqual({
            status: "ok",
            service: "meterflow-api",
        })

        expect(
            response.headers["x-request-id"],
        ).toBeTruthy()
    })

    it("returns 404 for unknown routes", async () => {
        const response = await request(app)
            .get("/not-found")
            .expect(404)

        expect(response.body.error).toMatchObject({
            code: "RESOURCE_NOT_FOUND",
            message: "Resource not found",
        })

        expect(response.body.error.requestId)
            .toBe(response.headers["x-request-id"])
    })
})
