export interface PaymentProvider {
  name: string;
  checkout(): Promise<string>;
}

export const paymentProvider: PaymentProvider | null = null;
