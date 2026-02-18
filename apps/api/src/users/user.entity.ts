// ─── User entity ─────────────────────────────────────────────────────────────
// Designed so fields map 1-to-1 to a DB entity later (TypeORM/Prisma).

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

// Public projection — never expose passwordHash
export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ph, ...pub } = user;
  return pub;
}
