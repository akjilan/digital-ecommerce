import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { type User, type PublicUser, type UserRole, toPublicUser } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  // ── Write ────────────────────────────────────────────────────────────────

  async create(
    name: string,
    email: string,
    password: string,
    role: UserRole = "user",
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 12);
    const dbUser = await this.prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: passwordHash,
        role,
      },
    });
    return this.toEntity(dbUser);
  }

  async update(
    id: string,
    data: { name?: string; passwordHash?: string },
  ): Promise<User | undefined> {
    try {
      const dbUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          // passwordHash in entity = password column in DB
          ...(data.passwordHash !== undefined && { password: data.passwordHash }),
        },
      });
      return this.toEntity(dbUser);
    } catch {
      return undefined;
    }
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase().trim();
    const dbUser = await this.prisma.user.findUnique({ where: { email: normalized } });
    return dbUser ? this.toEntity(dbUser) : undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const dbUser = await this.prisma.user.findUnique({ where: { id } });
    return dbUser ? this.toEntity(dbUser) : undefined;
  }

  async findAll(): Promise<PublicUser[]> {
    const dbUsers = await this.prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return dbUsers.map((u) => toPublicUser(this.toEntity(u)));
  }

  // ── Auth helpers ─────────────────────────────────────────────────────────

  async validatePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  // ── Private mapper ───────────────────────────────────────────────────────
  // Bridges the Prisma column name (`password`) to the entity field name
  // (`passwordHash`) that the rest of the application expects.

  private toEntity(dbUser: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
  }): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.password,
      role: dbUser.role as UserRole,
      createdAt: dbUser.createdAt,
    };
  }
}
