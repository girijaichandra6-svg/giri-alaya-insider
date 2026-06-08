import { prisma } from "@alaya/db/client";

export interface SubscribeParams {
  email: string;
  segments?: string[];
}

export async function subscribeToNewsletter(params: SubscribeParams) {
  const { email, segments = [] } = params;

  const subscription = await prisma.emailSubscription.upsert({
    where: { email },
    update: {
      status: "ACTIVE",
      segments,
    },
    create: {
      email,
      status: "ACTIVE",
      segments,
    },
  });

  // TODO: Trigger welcome email via Resend
  // await sendWelcomeEmail(email);

  return subscription;
}

export async function unsubscribe(email: string) {
  return prisma.emailSubscription.update({
    where: { email },
    data: { status: "UNSUBSCRIBED" },
  });
}

export async function getSubscriptionStatus(email: string) {
  return prisma.emailSubscription.findUnique({
    where: { email },
  });
}

export async function getSubscriberCount(): Promise<number> {
  return prisma.emailSubscription.count({
    where: { status: "ACTIVE" },
  });
}
