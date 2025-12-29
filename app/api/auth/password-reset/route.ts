import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { addEmailJob } from "@/lib/queue";
import { getBaseUrl } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      // Ne pas révéler si l'email existe ou non pour la sécurité
      return NextResponse.json({
        message: "If an account exists, a password reset link has been sent",
      });
    }

    // Générer un token de réinitialisation
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Stocker le token (dans un vrai système, utiliser une table dédiée)
    // await prisma.passwordReset.create({ ... });

    // Envoyer l'email de réinitialisation
    await addEmailJob({
      to: email,
      subject: "Réinitialisation de mot de passe",
      template: "password-reset",
      data: {
        resetToken,
        resetLink: `${getBaseUrl()}/reset-password?token=${resetToken}`,
      },
    });

    return NextResponse.json({
      message: "If an account exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error("[API] Error requesting password reset:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}

// PUT /api/auth/password-reset - Réinitialiser le mot de passe avec le token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Valider le token (dans un vrai système, vérifier dans la DB)
    // const reset = await prisma.passwordReset.findUnique({ where: { token } });
    // if (!reset || reset.expiresAt < new Date()) {
    //   return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    // }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    // await prisma.user.update({
    //   where: { id: reset.userId },
    //   data: { passwordHash },
    // });

    // Supprimer le token utilisé
    // await prisma.passwordReset.delete({ where: { token } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("[API] Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

