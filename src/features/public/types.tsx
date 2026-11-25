export type BillingCycle = "MONTHLY" | "YEARLY";

export interface PublicPackage {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  billingCycle: BillingCycle;
  studentLimit: number;
  isActive?: boolean;
}
