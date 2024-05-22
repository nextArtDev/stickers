import { z } from 'zod'

export const uploadSchema = z.object({
  image: z.any(),
})
export const updateUploadSchema = z.object({
  id: z.string(),

  color: z.string(),
  model: z.string(),
  material: z.string(),
  finish: z.string(),

  image: z.any(),
})
