import dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Accounts provided by SauceDemo. Each one simulates a different application behaviour,
 * which lets us cover happy paths, negative paths and known defects.
 */
export const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export type UserKey = keyof typeof USERS;
export type Username = (typeof USERS)[UserKey];

/** Public demo password. Read from the environment so it is never hard-coded in specs. */
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

/** Where the authenticated session of `standard_user` is stored by `auth.setup.ts`. */
export const STORAGE_STATE = 'playwright/.auth/standard_user.json';
