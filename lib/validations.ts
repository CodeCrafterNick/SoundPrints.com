import { z } from 'zod'

// Common schemas
export const emailSchema = z.string().email('Invalid email address')

export const urlSchema = z.string().url('Invalid URL')

// Order creation schema
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100),
    designData: z.object({
      waveformDataUrl: z.string().optional(),
      settings: z.record(z.string(), z.unknown()).optional()
    }).optional()
  })).min(1).max(50),
  shippingAddress: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    address1: z.string().min(1).max(200),
    address2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    zip: z.string().min(1).max(20),
    country: z.string().length(2), // ISO country code
    phone: z.string().max(20).optional()
  }),
  paymentIntentId: z.string().min(1)
})

// Payment intent schema
export const createPaymentIntentSchema = z.object({
  amount: z.number().int().positive().max(1000000), // Max $10,000
  currency: z.string().length(3).default('usd'),
  metadata: z.record(z.string(), z.string()).optional()
})

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000)
})

// Upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/mp3'].includes(type),
    'Invalid file type'
  ),
  size: z.number().int().positive().max(50 * 1024 * 1024) // 50MB max
})

// Design settings schema (for saving/loading designs)
export const designSettingsSchema = z.object({
  waveformColor: z.string(),
  waveformStyle: z.string(),
  backgroundColor: z.string(),
  backgroundImage: z.string().nullable().optional(),
  textElements: z.array(z.object({
    id: z.string(),
    text: z.string(),
    x: z.number(),
    y: z.number(),
    fontSize: z.number(),
    fontFamily: z.string(),
    color: z.string()
  })).optional(),
  waveformSize: z.number().optional(),
  waveformX: z.number().optional(),
  waveformY: z.number().optional()
})

// Validation helper
export function validateRequest<T>(schema: z.Schema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

// Format Zod errors for API responses
export function formatZodError(error: z.ZodError): { field: string; message: string }[] {
  return error.issues.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }))
}
