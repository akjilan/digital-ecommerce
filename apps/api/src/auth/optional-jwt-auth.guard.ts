import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Optional JWT guard — if a valid JWT is present the user is attached to the
 * request (req.user). If there is NO token or the token is invalid the request
 * is still allowed to proceed with req.user === undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
    override async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            // Try to run normal JWT validation
            await super.canActivate(context);
        } catch {
            // Token missing or invalid — that's fine, just continue as guest
        }
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override handleRequest<TUser = any>(_err: any, user: any, _info: any): TUser {
        // Don't throw on missing/invalid token — just return null
        return user || null;
    }
}
