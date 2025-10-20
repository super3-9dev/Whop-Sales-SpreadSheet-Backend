import { WhopReceipt } from './types';
import { WhopServerSdk } from '@whop/api';
import Whop from '@whop/sdk';
export declare const whopSdk: WhopServerSdk;
export declare const whopClient: Whop;
export declare function fetchAllReceipts(companyId: string, startDate?: string, endDate?: string): Promise<WhopReceipt[]>;
export declare function createProduct(title: string, description?: string): Promise<any>;
export declare function createCheckoutLink(productId: string, internalName: string, title: string, price?: string, currency?: string): Promise<any>;
export declare function createMultipleCheckoutLinks(productId: string, count?: number): Promise<any[]>;
export declare function trackCheckoutLinksByInternalName(internalName: string, startDate?: string, endDate?: string): Promise<any[]>;
export declare function getAllCheckoutLinks(): Promise<any[]>;
//# sourceMappingURL=whopApi.d.ts.map