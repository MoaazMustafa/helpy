import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './_sync';

export const wallets = sqliteTable('wallets', {
  ...syncColumns,
  name: text('name').notNull(),
  currency: text('currency').notNull().default('USD'),
  balanceCents: integer('balance_cents').notNull().default(0),
});

export const categories = sqliteTable('categories', {
  ...syncColumns,
  name: text('name').notNull(),
  kind: text('kind', { enum: ['task', 'expense'] }).notNull(),
  color: text('color'),
  icon: text('icon'),
});

export const transactions = sqliteTable('transactions', {
  ...syncColumns,
  walletId: text('wallet_id').notNull(),
  categoryId: text('category_id'),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('USD'),
  type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  occurredAt: integer('occurred_at').notNull(),
  note: text('note'),
});

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
