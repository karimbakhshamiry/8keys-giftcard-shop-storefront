// Payment Service for Crypto, SEPA, and Virtual Card operations

// For serverless API proxying, we use Next.js API routes. When running in the browser,
// we also support a test mode toggle that can be enabled via env or localStorage.
const API_BASE_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'https://api.payment-provider.com'

// Types for Crypto Deposit
export interface TravelRuleDetails {
  iAmOwnerOfWallet?: boolean
  firstName?: string
  lastName?: string
  city?: string
  street?: string
  postCode?: string
  country?: string
  companyName?: string
  vatId?: string
}

export interface UpdateTravelRuleRequest {
  walletType: 'CUSTODIAL' | 'SELF_CUSTODY'
  externalUserId?: string
  details: TravelRuleDetails
}

// Types for SEPA Transfer
export interface SepaTransferRequest {
  sourceExternalUserId: string
  currency: string
  amount: string
  receiverFirstName?: string
  receiverLastName?: string
  companyName?: string
  receiverType: 'NATURAL' | 'LEGAL'
  destinationIban: string
  transferTitle: string
}

export interface SepaTransferResponse {
  transferId: string
}

export interface SepaTransferDetails {
  id: string
  type: string
  amount: number
  transferTitle: string
  destinationIban: string
  receiverFirstName?: string
  receiverLastName?: string
  status: string
  currency: string
  fee: number
  createdAt: string
  user: {
    externalUserId: string
    email: string
    firstName: string
    lastName: string
    address: string
    city: string
    country: string
    documentType: string
    documentNumber: string
    pesel?: string
    birthCountry?: string
    birthDate?: string
  }
}

// Types for Virtual Cards
export interface CreateVirtualCardRequest {
  externalUserId: string
  label: string
  pin: string
}

export interface VirtualCardResponse {
  cardId: string
  cardNumber: string
  cvv: string
  exp: string
}

export interface VirtualCard {
  cardId: string
  status: string
  label: string
  cardLastDigits: string
}

export interface VirtualCardDetails {
  status: string
  cardNumber: string
  cvv: string
  exp: string
}

export interface CardLimits {
  monthlyTrxAll: number
  dailyTrxAll: number
  monthlyTrxAtm: number
  dailyTrxAtm: number
  monthlyTrxEcom: number
  dailyTrxEcom: number
}

export interface UpdateCardLimitsRequest {
  externalUserId: string
  cardId: string
  monthlyTrxAll: number
  dailyTrxAll: number
  monthlyTrxAtm: number
  dailyTrxAtm: number
  monthlyTrxEcom: number
  dailyTrxEcom: number
}

// Payment Service Class
export class PaymentService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Determine test mode from env or localStorage toggle
    let testMode = false
    try {
      if (typeof process !== 'undefined') {
        // Prefer NEXT_PUBLIC_ var for client-side
        // const envFlag = (process as any).env?.NEXT_PUBLIC_PAYMENTS_TEST_MODE || (process as any).env?.PAYMENTS_TEST_MODE
        // if (envFlag === true) testMode = true
        if (process.env.PAYMENTS_TEST_MODE) testMode = true
      }
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('payments_test_mode')
        if (stored === 'true') testMode = true
      }
    } catch {}

    // Append mock=1 for our internal API routes to trigger mocking
    let url = `${API_BASE_URL}${endpoint}`
    if (endpoint.startsWith('/api/') && testMode) {
      url += endpoint.includes('?') ? '&mock=1' : '?mock=1'
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.errorName || JSON.stringify(errorData)
      } catch {}
      throw new Error(errorMessage)
    }

    return response.json()
  }

  // Crypto Deposit Methods
  static async updateTravelRule(
    cryptoDepositId: string,
    data: UpdateTravelRuleRequest
  ): Promise<{ message: string }> {
    return this.makeRequest(`/v1/crypto-deposit/update-travel-rule/${cryptoDepositId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // SEPA Transfer Methods
  static async createSepaTransfer(data: SepaTransferRequest): Promise<SepaTransferResponse> {
    // Proxy through Next.js API route; mock mode supported via makeRequest()
    return this.makeRequest('/api/p100-sepa-transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async getSepaTransferDetails(transferId: string): Promise<SepaTransferDetails> {
    return this.makeRequest(`/v1/sepa-transfer/details/${transferId}`)
  }

  // Virtual Card Methods
  static async createVirtualCard(data: CreateVirtualCardRequest): Promise<VirtualCardResponse> {
    // Proxy through Next.js API route; mock mode supported via makeRequest()
    return this.makeRequest('/api/p100-virtual-card', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async getAllUserCards(externalUserId: string): Promise<{ cards: VirtualCard[] }> {
    return this.makeRequest(`/v1/card/all/${externalUserId}`)
  }

  static async getCardDetails(externalUserId: string, cardId: string): Promise<VirtualCardDetails> {
    return this.makeRequest(`/v1/card/details/${externalUserId}/${cardId}`)
  }

  static async updateCardPin(externalUserId: string, cardId: string, pin: string): Promise<{ message: string }> {
    return this.makeRequest('/v1/card/pin', {
      method: 'PATCH',
      body: JSON.stringify({ externalUserId, cardId, pin }),
    })
  }

  static async blockCard(externalUserId: string, cardId: string): Promise<{ message: string }> {
    return this.makeRequest('/v1/card/block', {
      method: 'PATCH',
      body: JSON.stringify({ externalUserId, cardId }),
    })
  }

  static async unblockCard(externalUserId: string, cardId: string): Promise<{ message: string }> {
    return this.makeRequest('/v1/card/unblock', {
      method: 'PATCH',
      body: JSON.stringify({ externalUserId, cardId }),
    })
  }

  static async getCardLimits(externalUserId: string, cardId: string): Promise<CardLimits> {
    return this.makeRequest(`/v1/card/limits/${externalUserId}/${cardId}`)
  }

  static async updateCardLimits(data: UpdateCardLimitsRequest): Promise<{ message: string }> {
    return this.makeRequest('/v1/card/limits', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async deleteCard(externalUserId: string, cardId: string): Promise<{ message: string }> {
    return this.makeRequest('/v1/card', {
      method: 'DELETE',
      body: JSON.stringify({ externalUserId, cardId }),
    })
  }
}

// Payment Method Enum
export enum PaymentMethod {
  CRYPTO = 'crypto',
  SEPA = 'sepa',
  VIRTUAL_CARD = 'virtual_card'
}

// Payment Status Enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Payment Interface
export interface Payment {
  id: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  currency: string
  externalUserId: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

// Payment Factory for creating different payment types
export class PaymentFactory {
  static async createCryptoPayment(
    externalUserId: string,
    amount: number,
    currency: string = 'USDC'
  ): Promise<Payment> {
    // Implementation for crypto payment creation
    const payment: Payment = {
      id: `crypto_${Date.now()}`,
      method: PaymentMethod.CRYPTO,
      status: PaymentStatus.PENDING,
      amount,
      currency,
      externalUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        walletType: 'SELF_CUSTODY',
        network: 'TON'
      }
    }
    
    return payment
  }

  static async createSepaPayment(
    externalUserId: string,
    amount: number,
    destinationIban: string,
    receiverInfo: {
      firstName: string
      lastName: string
      receiverType: 'NATURAL' | 'LEGAL'
      companyName?: string
    }
  ): Promise<Payment> {
    const sepaTransfer = await PaymentService.createSepaTransfer({
      sourceExternalUserId: externalUserId,
      currency: 'eur',
      amount: amount.toString(),
      receiverFirstName: receiverInfo.firstName,
      receiverLastName: receiverInfo.lastName,
      companyName: receiverInfo.companyName,
      receiverType: receiverInfo.receiverType,
      destinationIban,
      transferTitle: 'Gift Card Purchase'
    })

    const payment: Payment = {
      id: sepaTransfer.transferId,
      method: PaymentMethod.SEPA,
      status: PaymentStatus.PROCESSING,
      amount,
      currency: 'EUR',
      externalUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        destinationIban,
        receiverInfo
      }
    }

    return payment
  }

  static async createVirtualCardPayment(
    externalUserId: string,
    amount: number,
    cardLabel: string = 'Gift Card Purchase'
  ): Promise<Payment> {
    const virtualCard = await PaymentService.createVirtualCard({
      externalUserId,
      label: cardLabel,
      pin: '1234' // Default PIN, should be generated securely
    })

    const payment: Payment = {
      id: virtualCard.cardId,
      method: PaymentMethod.VIRTUAL_CARD,
      status: PaymentStatus.PENDING,
      amount,
      currency: 'EUR',
      externalUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        cardNumber: virtualCard.cardNumber,
        cardLastDigits: virtualCard.cardNumber.slice(-4),
        label: cardLabel
      }
    }

    return payment
  }
}

export default PaymentService 