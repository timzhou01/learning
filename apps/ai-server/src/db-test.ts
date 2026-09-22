import "dotenv/config"
import { db } from "./db/client.js"

const result = await db.query("SELECT NOW()")

console.log(result.rows)

await db.end()