import { pgTable, text, timestamp, uuid, decimal, integer, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  email: text('email').notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, completed, cancelled
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
  shipping: decimal('shipping', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productType: text('product_type').notNull(), // poster, t-shirt, mug, canvas, hoodie
  size: text('size').notNull(),
  audioFileName: text('audio_file_name').notNull(),
  audioFileUrl: text('audio_file_url').notNull(),
  waveformColor: text('waveform_color').notNull(),
  backgroundColor: text('background_color').notNull(),
  customText: text('custom_text'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  printFileUrl: text('print_file_url'), // High-res export for printing
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const audioFiles = pgTable('audio_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  duration: decimal('duration', { precision: 10, scale: 2 }),
  mimeType: text('mime_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type AudioFile = typeof audioFiles.$inferSelect
export type NewAudioFile = typeof audioFiles.$inferInsert
