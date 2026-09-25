import {
    Router,
} from "express"

import {
    ProjectRepository,
} from "./repository/project.repository.js"

import {
    ProjectRuleRepository,
} from "./repository/project-rule.repository.js"

import {
    ProjectRuleService,
} from "./service/project-rule.service.js"

import {
    ProjectRuleController,
} from "./controller/project-rule.controller.js"

const projectRepository =
    new ProjectRepository()

const projectRuleRepository =
    new ProjectRuleRepository()

const projectRuleService =
    new ProjectRuleService(
        projectRepository,
        projectRuleRepository,
    )

const projectRuleController =
    new ProjectRuleController(
        projectRuleService,
    )

export const projectRuleRouter:
    Router =
    Router()

projectRuleRouter.post(
    "/:projectId/rules",
    projectRuleController.createRule,
)

projectRuleRouter.get(
    "/:projectId/rules",
    projectRuleController.getRules,
)