import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import * as bcrypt from "bcryptjs";
import { type User, type PublicUser, toPublicUser, type UserRole } from "./user.entity";

// ─── In-memory store ─────────────────────────────────────────────────────────
// Replace this store with a TypeORM/Prisma repository to add DB support.
// All methods return Promises to match the future repository interface.

@Injectable()
export class UsersService {
  private readonly users: Map<string, User> = new Map();

  async create(
    name: string,
    email: string,
    password: string,
    role: UserRole = "user",
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user: User = {
      id: randomUUID(),
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === normalized) return user;
    }
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async update(
    id: string,
    data: { name?: string; passwordHash?: string },
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated: User = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(): Promise<PublicUser[]> {
    return Array.from(this.users.values()).map(toPublicUser);
  }

  async validatePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
