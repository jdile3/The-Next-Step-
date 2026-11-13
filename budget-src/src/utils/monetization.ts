/**
 * ============================================================================
 * THE NEXT STEP — CENTRAL MONETIZATION, AD & WEBSITE CONFIGURATION
 * ============================================================================
 * Automatically reads from `window.TNS_MONETIZATION_CONFIG` at the top of
 * `budget.html` / `index.html` so you can edit your Stripe Link, Website URL,
 * and Sponsor Banner links directly on GitHub in plain English without ever
 * needing to recompile the app!
 */

export interface SponsorBannerItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
}

export interface VideoCommercialConfig {
  id: string;
  enabled: boolean;
  sponsorName: string;
  headline: string;
  subheadline: string;
  bullets: string[];
  videoMp4Url?: string;
  ctaText: string;
  ctaUrl: string;
  skipDelaySeconds: number;
  cooldownMinutes: number;
}

interface GlobalMonetizationConfig {
  STRIPE_PAYMENT_LINK_URL?: string;
  OFFICIAL_WEBSITE_URL?: string;
  ADSENSE_CONFIG?: {
    enabled: boolean;
    publisherId: string;
    bannerSlotId: string;
  };
  SPONSOR_BANNERS?: SponsorBannerItem[];
  VIDEO_AD_CONFIG?: Partial<VideoCommercialConfig>;
}

function getWindowConfig(): GlobalMonetizationConfig {
  if (typeof window !== "undefined" && (window as any).TNS_MONETIZATION_CONFIG) {
    return (window as any).TNS_MONETIZATION_CONFIG as GlobalMonetizationConfig;
  }
  return {};
}

const winCfg = getWindowConfig();

// 1. STRIPE ONE-TIME PRO CHECKOUT ($6.99 Lifetime Unlock)
export const STRIPE_PAYMENT_LINK_URL: string =
  typeof winCfg.STRIPE_PAYMENT_LINK_URL === "string" && winCfg.STRIPE_PAYMENT_LINK_URL
    ? winCfg.STRIPE_PAYMENT_LINK_URL
    : "https://buy.stripe.com/3cIfZiaWi0MYaBz8YNfjG00";

// 2. YOUR OFFICIAL LIVE WEBSITE / GITHUB PAGES APP URL
export const OFFICIAL_WEBSITE_URL: string =
  typeof winCfg.OFFICIAL_WEBSITE_URL === "string" ? winCfg.OFFICIAL_WEBSITE_URL : "";

// 3. GOOGLE ADSENSE CONFIGURATION (Optional)
export const ADSENSE_CONFIG = {
  enabled: winCfg.ADSENSE_CONFIG?.enabled ?? false,
  publisherId: winCfg.ADSENSE_CONFIG?.publisherId || "ca-pub-0000000000000000",
  bannerSlotId: winCfg.ADSENSE_CONFIG?.bannerSlotId || "0000000000",
};

// 4. ROTATING AFFILIATE / SPONSOR BANNERS (Shown during 30-Day Trial & Free Tier)
export const SPONSOR_BANNERS: SponsorBannerItem[] =
  Array.isArray(winCfg.SPONSOR_BANNERS) && winCfg.SPONSOR_BANNERS.length > 0
    ? winCfg.SPONSOR_BANNERS
    : [
        {
          id: "sponsor-cashback-gas",
          tag: "Featured Partner",
          title: "Save Up to 25¢/Gal on Gas & Groceries",
          description:
            "Earn automatic cash back at Shell, Circle K, Speedway, and local grocery stores.",
          ctaText: "Claim Free Bonus",
          ctaUrl: "", // Paste your Upside / Cash App / Chime referral URL here
        },
        {
          id: "sponsor-high-yield",
          tag: "Smart Money Partner",
          title: "Stop Getting Paid 0.01% by Your Bank",
          description:
            "Get paid up to 2 days early with zero monthly maintenance or overdraft fees.",
          ctaText: "Learn More",
          ctaUrl: "", // Paste your banking affiliate / referral URL here
        },
        {
          id: "sponsor-tns-pro",
          tag: "The Next Step Pro",
          title: "Remove All Ads & Unlock Unlimited Accounts",
          description:
            "One-time $6.99 lifetime unlock. Zero monthly subscriptions. 100% private.",
          ctaText: "Unlock Pro",
          ctaUrl: "INTERNAL_UPGRADE",
        },
      ];

// 5. POST-TRIAL (DAY 31+) VIDEO / COMMERCIAL AD CONFIGURATION
export const VIDEO_AD_CONFIG: VideoCommercialConfig = {
  id: winCfg.VIDEO_AD_CONFIG?.id || "video-ad-post-trial",
  enabled: winCfg.VIDEO_AD_CONFIG?.enabled ?? true,
  sponsorName:
    winCfg.VIDEO_AD_CONFIG?.sponsorName || "The Next Step · Sponsored Message",
  headline:
    winCfg.VIDEO_AD_CONFIG?.headline || "Your 30-Day Free Trial Has Ended",
  subheadline:
    winCfg.VIDEO_AD_CONFIG?.subheadline ||
    "You are currently using the ad-supported Free Tier (2 accounts max). Watch this 5-second message to continue for free, or unlock Lifetime Pro to remove all video & banner ads forever.",
  bullets: winCfg.VIDEO_AD_CONFIG?.bullets || [
    "Unlimited Checking, Savings, Cash App & Card Accounts",
    "Full Recurring Bill Calendar, Goals & Reality Check Mirror",
    "100% Ad-Free Forever — Zero Monthly Subscriptions",
  ],
  videoMp4Url: winCfg.VIDEO_AD_CONFIG?.videoMp4Url || "",
  ctaText: winCfg.VIDEO_AD_CONFIG?.ctaText || "Remove All Ads Forever",
  ctaUrl: winCfg.VIDEO_AD_CONFIG?.ctaUrl || "INTERNAL_UPGRADE",
  skipDelaySeconds: winCfg.VIDEO_AD_CONFIG?.skipDelaySeconds ?? 5,
  cooldownMinutes: winCfg.VIDEO_AD_CONFIG?.cooldownMinutes ?? 4,
};

/**
 * Returns the public shareable URL for QR codes and friend referrals.
 * Automatically rewrites private AI Studio `ais-dev-` sandbox URLs to the shared `ais-pre-` URL
 * so scanning a QR code on another phone doesn't hit the developer-only login wall.
 */
export function getPublicShareUrl(): string {
  const dynamicUrl = getWindowConfig().OFFICIAL_WEBSITE_URL || OFFICIAL_WEBSITE_URL;
  if (dynamicUrl && dynamicUrl.trim()) {
    return dynamicUrl.trim();
  }
  if (typeof window === "undefined") return "";

  const rawOrigin = window.location.origin;
  const rawPath = window.location.pathname || "/";

  // If the founder has the private `ais-dev-` preview open, convert it to `ais-pre-`
  if (rawOrigin.includes("://ais-dev-")) {
    return rawOrigin.replace("://ais-dev-", "://ais-pre-") + rawPath;
  }

  return rawOrigin + rawPath;
}
