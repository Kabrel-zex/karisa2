import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/auth";
import { verify2FAToken } from "@/lib/two-factor";
import type { UserRole } from "@prisma/client";


export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Authentifie un utilisateur avec email/password et optionnellement 2FA
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        twoFactorAuth: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(
      credentials.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Vérifier 2FA si activé
    if (user.twoFactorAuth?.isEnabled) {
      if (!credentials.twoFactorToken) {
        throw new Error("2FA token required");
      }

      const isValid2FA = await verify2FAToken(user.id, credentials.twoFactorToken);
      if (!isValid2FA) {
        throw new Error("Invalid 2FA token");
      }
    }

    // Générer les tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Stocker le refresh token en Redis (à implémenter)
    //await redis.set(`refresh:${user.id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rafraîchit un access token avec un refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = verifyAccessToken(refreshToken);
    if (!payload) {
      throw new Error("Invalid refresh token");
    }

    // Vérifier que le refresh token existe en Redis
    // const stored = await redis.get(`refresh:${payload.userId}`);
    // if (stored !== refreshToken) {
    //   throw new Error("Refresh token not found");
    // }

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken: newAccessToken };
  }

  /**
   * Déconnecte un utilisateur (blacklist le token)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    // Ajouter le refresh token à la blacklist Redis
    // await redis.set(`blacklist:${refreshToken}`, "1", "EX", 7 * 24 * 60 * 60);
    // await redis.del(`refresh:${userId}`);
  }

  /**
   * Vérifie si un token est valide
   */
  async verifyToken(token: string): Promise<boolean> {
    const payload = verifyAccessToken(token);
    if (!payload) {
      return false;
    }

    // Vérifier si le token est blacklisté
    // const blacklisted = await redis.get(`blacklist:${token}`);
    // return !blacklisted;

    return true;
  }
}

export const authService = new AuthService();

