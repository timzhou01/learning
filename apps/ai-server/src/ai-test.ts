import "dotenv/config"
import { createTask } from "./tasks/create-task.js"

const task = await createTask(
    "给现有项目增加一个用户登录接口"
)

console.dir(task, {
    depth: null,
})