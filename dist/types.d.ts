export interface WhopReceipt {
    id: string;
    address: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    settledUsdAmount: number;
    billingReason: string;
    last4?: string;
    currency: string;
    status: 'draft' | 'open' | 'paid' | 'pending' | 'uncollectible' | 'unresolved' | 'void';
    createdAt: number;
    total: number;
    brand?: string;
    paymentProcessor: 'apple' | 'coinbase' | 'crypto' | 'free' | 'multi_psp' | 'nft' | 'paypal' | 'platform_balance' | 'sezzle' | 'splitit' | 'stripe';
    paymentMethodType?: string;
    disputeAlertedAt?: number;
    finalAmount: number;
    presentedFinalAmount: number;
    presentedSettledUsdAmount: number;
    refundedAmount?: number;
    friendlyStatus: 'auto_refunded' | 'canceled' | 'dispute_warning' | 'drafted' | 'failed' | 'incomplete' | 'open_dispute' | 'open_resolution' | 'partially_refunded' | 'past_due' | 'pending' | 'price_too_low' | 'refunded' | 'succeeded' | 'uncollectible' | 'unresolved';
    failureMessage?: string;
    refundable: boolean;
    retryable: boolean;
    paidAt?: number;
    amountAfterFees: number;
    chargeSkippedPriceTooLow: boolean;
    lastPaymentAttempt?: number;
    autoRefunded: boolean;
    member: {
        header: string;
        user: {
            id: string;
            username: string;
            name: string;
            email: string;
            country: string;
            countryName: string;
        };
        imageSrcset: {
            original: string;
            double: string;
            isVideo: boolean;
        };
    };
    plan: {
        id: string;
        title: string;
        formattedPrice: string;
        initialPrice: number;
        renewalPrice: number;
        paymentLinkDescription: string;
    };
    membership: {
        id: string;
        status: 'active' | 'canceled' | 'completed' | 'drafted' | 'expired' | 'past_due' | 'trialing' | 'unresolved';
    };
    promoCode?: {
        id: string;
        code: string;
        amountOff: number;
        baseCurrency: string;
        promoType: 'flat_amount' | 'percentage';
        numberOfIntervals: number;
    };
    accessPass?: {
        id: string;
        title: string;
    };
    totalUsdAmount: number;
    mostRecentRiskScore?: number;
}
export interface WhopReceiptsResponse {
    receipts: {
        nodes: WhopReceipt[];
        pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
        };
    };
}
export interface DailySalesData {
    date: string;
    totalSales: number;
    totalCash: number;
    averagePerSale: number;
}
export interface SummaryStats {
    totalSales: number;
    totalPaidSales: number;
    totalCash: number;
    averageSaleAmount: number;
    statusBreakdown: Record<string, number>;
}
export interface GenerateReportRequest {
    startDate: string;
    endDate: string;
}
export interface GenerateReportResponse {
    success: boolean;
    message: string;
    data?: {
        dailySales: DailySalesData[];
        summary: SummaryStats;
    };
    file?: string;
}
export interface ApiStatusResponse {
    status: string;
    timestamp: string;
    version: string;
}
export interface ConnectionTestResponse {
    connected: boolean;
    message?: string;
    error?: string;
}
export interface ConfigResponse {
    configured: boolean;
    checkoutIdsCount: number;
    hasApiKey: boolean;
}
export interface ApiError {
    error: string;
    message?: string;
}
//# sourceMappingURL=types.d.ts.map