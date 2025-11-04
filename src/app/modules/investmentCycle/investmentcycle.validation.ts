import { z } from "zod";

export const investmentCycleValidation = {
  create: z.object({
    body: z.object({
      name: z.string().min(1, "Name is required"),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().optional(),
      totalDeposit: z.number().optional(),
      totalProfit: z.number().optional(),
      isInvested: z.boolean().optional(),
      distributed: z.boolean().optional(),
      endDate: z.string().optional(),
    }),
  }),

  distribute: z.object({
    body: z.object({
      totalProfit: z.number().min(0, "Profit must be positive"),
    }),
  }),
};
