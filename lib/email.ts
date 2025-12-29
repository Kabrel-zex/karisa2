import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

import { getBaseUrl } from "./config";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${getBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vérifiez votre email</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Merci de confirmer votre adresse email pour activer votre compte Ampora.</p>
            <a class="button" href="${verifyUrl}">Vérifier mon email</a>
            <p>Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Vérifiez votre email",
    html,
  })
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Ampora" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return { success: false, error };
  }
}

// Templates d'emails transactionnels

export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue sur Ampora !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${name},</p>
            <p>Nous sommes ravis de vous accueillir sur Ampora, la marketplace dédiée aux artisans et créateurs.</p>
            <p>Votre compte a été créé avec succès. Vous pouvez dès maintenant :</p>
            <ul>
              <li>Découvrir notre catalogue de produits artisanaux</li>
              <li>Créer votre boutique si vous êtes artisan</li>
              <li>Participer à notre communauté</li>
            </ul>
            <a href="${getBaseUrl()}/login" class="button">Se connecter</a>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <p>Cordialement,<br>L'équipe Ampora</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Bienvenue sur Ampora !",
    html,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderTotal: number,
  orderItems: Array<{ name: string; quantity: number; price: number }>
) {
  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)}€</td>
      <td>${(item.quantity * item.price).toFixed(2)}€</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #e5e7eb; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirmation de commande</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Votre commande <strong>${orderNumber}</strong> a été confirmée avec succès !</p>
            <h3>Détails de votre commande :</h3>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="total">Total : ${orderTotal.toFixed(2)}€</div>
            <p>Vous recevrez un email de confirmation d'expédition dès que votre commande sera expédiée.</p>
            <a href="${getBaseUrl()}/account/orders" class="button">Suivre ma commande</a>
            <p>Cordialement,<br>L'équipe Ampora</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Confirmation de commande ${orderNumber}`,
    html,
  });
}

export async function sendVendorApplicationReceivedEmail(email: string, businessName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Candidature vendeur reçue</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Nous avons bien reçu votre candidature pour la boutique <strong>${businessName}</strong>.</p>
            <p>Notre équipe va l'examiner sous 7 jours. Vous serez notifié par email dès qu'une décision sera prise.</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `
  return sendEmail({ to: email, subject: "Votre candidature vendeur a été reçue", html })
}

export async function sendVendorApplicationApprovalEmail(email: string, businessName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Votre boutique est approuvée</h1>
          </div>
          <div class="content">
            <p>Félicitations ! Votre candidature pour <strong>${businessName}</strong> a été approuvée.</p>
            <p>Vous pouvez maintenant configurer votre boutique et publier vos produits.</p>
            <a class="button" href="${getBaseUrl()}/vendor">Accéder au dashboard</a>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `
  return sendEmail({ to: email, subject: "Votre boutique est approuvée", html })
}

export async function sendVendorApplicationRejectionEmail(email: string, businessName: string, reason?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Candidature refusée</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Votre candidature pour <strong>${businessName}</strong> n'a pas été approuvée.</p>
            ${reason ? `<p>Raison : ${reason}</p>` : ""}
            <p>Vous pourrez soumettre une nouvelle candidature ultérieurement.</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `
  return sendEmail({ to: email, subject: "Candidature vendeur – décision", html })
}

export async function sendAdminVendorApplicationAlert(adminEmail: string, applicantEmail: string, businessName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouvelle candidature vendeur</h1>
          </div>
          <div class="content">
            <p>Une nouvelle candidature a été soumise.</p>
            <ul>
              <li><strong>Boutique :</strong> ${businessName}</li>
              <li><strong>Email candidat :</strong> ${applicantEmail}</li>
            </ul>
            <p>Rendez-vous dans le dashboard admin pour la traiter.</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
          </div>
        </div>
      </body>
    </html>
  `
  return sendEmail({ to: adminEmail, subject: "Ampora - Nouvelle candidature vendeur", html })
}

export async function sendShippingNotificationEmail(
  email: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .tracking { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Votre commande a été expédiée !</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Votre commande <strong>${orderNumber}</strong> a été expédiée.</p>
            <div class="tracking">
              <p><strong>Transporteur :</strong> ${carrier}</p>
              <p><strong>Numéro de suivi :</strong> ${trackingNumber}</p>
            </div>
            <p>Vous pouvez suivre votre colis en utilisant le numéro de suivi ci-dessus sur le site du transporteur.</p>
            <a href="${getBaseUrl()}/tracking/${trackingNumber}" class="button">Suivre mon colis</a>
            <p>Cordialement,<br>L'équipe Ampora</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Votre commande ${orderNumber} a été expédiée`,
    html,
  });
}

export async function sendReviewReminderEmail(
  email: string,
  orderNumber: string,
  productName: string,
  productId: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Partagez votre avis !</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Nous espérons que vous êtes satisfait de votre commande <strong>${orderNumber}</strong>.</p>
            <p>Votre avis nous aide beaucoup et permet à d'autres clients de faire leur choix. Prenez quelques instants pour laisser un avis sur :</p>
            <p><strong>${productName}</strong></p>
            <a href="${getBaseUrl()}/products/${productId}?review=true" class="button">Laisser un avis</a>
            <p>Merci pour votre confiance !</p>
            <p>Cordialement,<br>L'équipe Ampora</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Partagez votre avis sur votre commande",
    html,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe sur Ampora.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            <div class="warning">
              <p><strong>Important :</strong> Ce lien est valide pendant 1 heure uniquement.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
            <p>Cordialement,<br>L'équipe Ampora</p>
          </div>
          <div class="footer">
            <p>Ampora - Marketplace artisanale</p>
            <p>Cet email a été envoyé à ${email}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe - Ampora",
    html,
  });
}

