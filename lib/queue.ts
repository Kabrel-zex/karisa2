/* eslint-disable @typescript-eslint/no-explicit-any */
// Placeholder pour les queues - À implémenter avec Bull ou RabbitMQ

export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export async function addEmailJob(job: EmailJob) {
  // Dans un vrai système, ajouter à la queue Bull/RabbitMQ
  console.log("Email job queued:", job);
  
  // Pour l'instant, simuler l'envoi
  // await sendEmail(job.to, job.subject, job.template, job.data);
  
  return { id: Math.random().toString(36).substring(7) };
}
