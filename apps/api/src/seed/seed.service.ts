import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";

/**
 * Seeds default users on every startup.
 * Because the store is in-memory, users are lost on each restart.
 * This guarantees there is always a known admin account to log in with.
 *
 * Credentials (overridable via .env):
 *   Admin : SEED_ADMIN_EMAIL    / SEED_ADMIN_PASSWORD
 *   User  : SEED_USER_EMAIL     / SEED_USER_PASSWORD
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly config: ConfigService,
    ) { }

    async onApplicationBootstrap() {
        try {
            await this.seedUser(
                this.config.get("SEED_ADMIN_EMAIL") || "admin@example.com",
                this.config.get("SEED_ADMIN_PASSWORD") || "Admin1234!",
                "Admin User",
                "admin",
            );

            await this.seedUser(
                this.config.get("SEED_USER_EMAIL") || "user@example.com",
                this.config.get("SEED_USER_PASSWORD") || "User1234!",
                "Test User",
                "user",
            );
        } catch (error) {
            this.logger.error("Seed failed:");
            this.logger.error(error);
        }
    }

    private async seedUser(email: string, password: string, name: string, role: "admin" | "user") {
        const existing = await this.usersService.findByEmail(email);
        if (existing) return; // already seeded (shouldn't happen with in-memory store, but safe)

        await this.usersService.create(name, email, password, role);
        this.logger.log(`Seeded ${role}: ${email} / ${password}`);
    }
}
