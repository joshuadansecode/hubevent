import { env } from '../config/env';
import { AppError } from '../utils/errors';

interface FedaPayTransaction {
  id: string;
  url: string;
  status: string;
  amount: number;
  reference: string;
}

export class FedaPayService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = env.fedapayMode === 'production'
      ? 'https://api.fedapay.com/v1'
      : 'https://sandbox-api.fedapay.com/v1';
    this.apiKey = env.fedapayApiKey;
  }

  async createCheckout(data: {
    amount: number;
    description: string;
    callbackUrl: string;
    reference: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
  }): Promise<FedaPayTransaction> {
    if (env.nodeEnv === 'development' || !this.apiKey) {
      console.log(`[FEDAPAY SIMULATION] Checkout created:`, data);
      return {
        id: `sim_${Date.now()}`,
        url: `/api/payments/simulate/${data.reference}`,
        status: 'pending',
        amount: data.amount,
        reference: data.reference,
      };
    }

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Api-Version': 'v1',
      },
      body: JSON.stringify({
        amount: data.amount,
        description: data.description,
        callback_url: data.callbackUrl,
        reference: data.reference,
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
        },
      }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new AppError(502, `FedaPay error: ${error?.message || 'Unknown error'}`);
    }

    const result: any = await response.json();
    return {
      id: result.transaction.id,
      url: result.transaction.url,
      status: result.transaction.status,
      amount: result.transaction.amount,
      reference: result.transaction.reference,
    };
  }

  async verifyTransaction(fedapayId: string): Promise<{ status: string }> {
    if (env.nodeEnv === 'development' || !this.apiKey) {
      return { status: 'approved' };
    }

    const response = await fetch(`${this.baseUrl}/transactions/${fedapayId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });

    if (!response.ok) throw new AppError(502, 'FedaPay verification failed');

    const result: any = await response.json();
    return { status: result.transaction.status };
  }
}
