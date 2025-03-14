
import { ContributionExports, ExtensionActivateExport, ExtensionContext, ExtensionExports, OperationContribution, OperationContributionBody, OperationContributionExports } from '@ciphereditor/types'
import { controlSchema } from './control'
import { errorOperationIssueSchema, operationRequestSchema, operationResultSchema } from './operation'
import { z } from 'zod'

export const contributionSchema =
  z.object({
    type: z.string(),
    name: z.string(),
    extensionUrl: z.string().optional()
  })

export const operationContributionSchema: z.ZodType<OperationContribution> =
  contributionSchema.extend({
    type: z.literal('operation'),
    label: z.string().optional(),
    description: z.string().optional(),
    url: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    controls: z.array(controlSchema)
  })

export const operationContributionBodySchema: z.ZodType<OperationContributionBody> =
  z.object({
    execute: z.function()
      .args(operationRequestSchema)
      .returns(z.union([
        z.promise(z.union([errorOperationIssueSchema, operationResultSchema])),
        z.union([errorOperationIssueSchema, operationResultSchema])
      ]))
  })

export const operationContributionExportsSchema: z.ZodType<OperationContributionExports> =
  z.object({
    contribution: operationContributionSchema,
    body: operationContributionBodySchema
  })

export const contributionExportsSchema: z.ZodType<ContributionExports> =
  operationContributionExportsSchema

export const extensionContextSchema: z.ZodType<ExtensionContext> =
  z.object({})

export const extensionActivateExportSchema: z.ZodType<ExtensionActivateExport> =
  z.function()
    .args(extensionContextSchema)
    .returns(z.union([
      z.array(contributionExportsSchema),
      z.promise(z.array(contributionExportsSchema))
    ]))

export const extensionExportsSchema: z.ZodType<ExtensionExports> = z.object({
  activate: extensionActivateExportSchema
})
