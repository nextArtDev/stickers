import { z } from 'zod'

export const uploadSchema = z.object({
  image: z.any(),
})
export const updateUploadSchema = z.object({
  id: z.string(),
  image: z.any(),
})
