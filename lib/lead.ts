export const SALES_SOURCES = [
  { value: "word_of_mouth", label: "Word of mouth" },
  { value: "existing_website", label: "Existing website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "social_media", label: "Social media" },
  { value: "other", label: "Other" },
] as const;

export const WEBSITE_GOALS = [
  { value: "generate_leads", label: "Generate leads" },
  { value: "increase_sales", label: "Increase sales" },
  { value: "increase_traffic", label: "Increase traffic" },
  { value: "build_awareness", label: "Build brand awareness" },
] as const;

export const TRANSACTION_VOLUMES = [
  { value: "0-10", label: "0 to 10" },
  { value: "11-50", label: "11 to 50" },
  { value: "51-200", label: "51 to 200" },
  { value: "200+", label: "200 or more" },
] as const;

export const TRANSACTION_VALUES = [
  { value: "under_50", label: "Under $50" },
  { value: "50_200", label: "$50 to $200" },
  { value: "200_1000", label: "$200 to $1,000" },
  { value: "1000_5000", label: "$1,000 to $5,000" },
  { value: "5000_plus", label: "$5,000 or more" },
] as const;

export type SalesSource = (typeof SALES_SOURCES)[number]["value"];
export type WebsiteGoal = (typeof WEBSITE_GOALS)[number]["value"];
export type TransactionVolume = (typeof TRANSACTION_VOLUMES)[number]["value"];
export type TransactionValue = (typeof TRANSACTION_VALUES)[number]["value"];

export type LeadPayload = {
  name: string;
  email: string;
  url: string;
  salesSource: SalesSource;
  websiteGoals: WebsiteGoal[];
  transactionVolume: TransactionVolume;
  transactionValue: TransactionValue;
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
