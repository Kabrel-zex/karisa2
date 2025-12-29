import { authenticator } from "otplib";
import QRCode from "qrcode";
import { prisma } from "./prisma";

export async function generate2FASecret(userId: string, method: "totp" | "sms" = "totp") {
  const userSecret = authenticator.generateSecret();
  const serviceName = "Karisa E-Commerce";
  const accountName = userId;

  const otpAuthUrl = authenticator.keyuri(accountName, serviceName, userSecret);

  // Sauvegarder le secret (temporairement, l'utilisateur doit activer 2FA)
  await prisma.twoFactorAuth.upsert({
    where: { userId },
    create: {
      userId,
      method,
      secret: userSecret,
      isEnabled: false,
      backupCodes: [],
    },
    update: {
      secret: userSecret,
      method,
    },
  });

  // Générer le QR code
  const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

  return {
    secret: userSecret,
    qrCodeUrl,
    otpAuthUrl,
  };
}

export async function verify2FAToken(userId: string, token: string): Promise<boolean> {
  const twoFactor = await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });

  if (!twoFactor || !twoFactor.isEnabled) {
    return false;
  }

  if (twoFactor.method === "totp") {
    return authenticator.verify({ token, secret: twoFactor.secret });
  }

  // Pour SMS, implémenter la vérification via service SMS
  return false;
}

export async function enable2FA(userId: string, token: string): Promise<boolean> {
  const twoFactor = await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });

  if (!twoFactor) {
    return false;
  }

  const isValid = authenticator.verify({ token, secret: twoFactor.secret });

  if (isValid) {
    // Générer des codes de secours
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        isEnabled: true,
        backupCodes,
      },
    });

    return true;
  }

  return false;
}

export async function generateBackupCodes(userId: string): Promise<string[]> {
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  await prisma.twoFactorAuth.update({
    where: { userId },
    data: { backupCodes },
  });

  return backupCodes;
}

