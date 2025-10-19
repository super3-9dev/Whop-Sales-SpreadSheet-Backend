import { WhopReceiptsResponse } from './types';
export interface WhopSdkConfig {
    apiKey: string;
}
export interface ListReceiptsParams {
    companyId: string;
    first?: number;
    after?: string;
    filter?: {
        accessPassIds?: string[];
        billingReasons?: string[];
        currencies?: string[];
        direction?: 'asc' | 'desc';
        endDate?: number;
        order?: 'created_at' | 'final_amount' | 'paid_at';
        paymentMethods?: string[];
        planIds?: string[];
        query?: string;
        startDate?: number;
        statuses?: string[];
    };
}
export declare class WhopSdk {
    private apiKey;
    private baseURL;
    constructor(config: WhopSdkConfig);
    listReceiptsForCompany(params: ListReceiptsParams): Promise<WhopReceiptsResponse>;
    private buildGraphQLQuery;
}
//# sourceMappingURL=whopSdk.d.ts.map