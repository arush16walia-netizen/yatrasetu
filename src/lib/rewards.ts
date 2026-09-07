import "server-only";
import { prisma } from "@/lib/prisma";

export type RewardView = {
  id: string;
  code: string;
  title: string;
  description: string;
  partner: string;
  type: string;
  value: string;
  costStamps: number;
  image: string | null;
};

export type RedemptionView = {
  id: string;
  code: string;
  redeemedAt: Date;
  reward: { title: string; partner: string; value: string; type: string };
};

export async function getUserRewardsView(userId: string) {
  const [stampsOwned, redemptions, rewards, points] = await Promise.all([
    prisma.userStamp.count({ where: { userId } }),
    prisma.redemption.findMany({
      where: { userId },
      orderBy: { redeemedAt: "desc" },
      include: { reward: { select: { title: true, partner: true, value: true, type: true } } },
    }),
    prisma.reward.findMany({ orderBy: { costStamps: "asc" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
  ]);

  return {
    stampsOwned,
    points: points?.points ?? 0,
    redemptions: redemptions as RedemptionView[],
    rewards: rewards as RewardView[],
  };
}

export type RedeemResult =
  | { ok: true; redemptionCode: string; rewardTitle: string; stampsLeft: number; pointsLeft: number }
  | { ok: false; error: string; status: number };

/**
 * Redeem a reward — a single transaction that:
 *  1. locks the user row,
 *  2. validates active reward + sufficient stamps,
 *  3. deducts stamps by creating a Redemption (the ledger),
 *  4. issues a unique coupon code.
 * Never trusts client-side balances.
 */
export async function redeemReward(userId: string, rewardId: string): Promise<RedeemResult> {
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) return { ok: false, error: "Reward not found.", status: 404 };

  const result = await prisma.$transaction(async (tx) => {
    const owned = await tx.userStamp.count({ where: { userId } });
    const already = await tx.redemption.count({ where: { userId, rewardId } });

    if (owned < reward.costStamps) {
      return { ok: false as const, error: `You need ${reward.costStamps} stamp${reward.costStamps === 1 ? "" : "s"} for this — you have ${owned}.`, status: 400 };
    }
    if (already > 0) {
      return { ok: false as const, error: "You've already redeemed this reward — check your codes below.", status: 400 };
    }

    const code = `YS-${reward.code.slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    const redemption = await tx.redemption.create({
      data: { userId, rewardId, code, costStamps: reward.costStamps },
      include: { reward: { select: { title: true } } },
    });

    return {
      ok: true as const,
      redemptionCode: redemption.code,
      rewardTitle: redemption.reward.title,
      stampsLeft: owned - reward.costStamps,
    };
  });

  if (!result.ok) return result;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
  return { ...result, pointsLeft: user?.points ?? 0 };
}

export async function getUserStampsView(userId: string) {
  const rows = await prisma.userStamp.findMany({
    where: { userId },
    orderBy: { earnedAt: "desc" },
    include: { stamp: true },
  });
  return rows;
}
