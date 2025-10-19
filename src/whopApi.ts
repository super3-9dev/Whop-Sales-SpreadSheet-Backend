import { WhopReceipt } from './types';
import { WhopServerSdk } from '@whop/api';



export const whopSdk: WhopServerSdk = WhopServerSdk({
  appId: "app_3XIlzJF8UGUQ7O",
  appApiKey: "AyjLw6hJTflHiwLUmbfiLPnOBUDHQfsQ8_DxinGudBk",
  onBehalfOfUserId: "user_89lYcdzn58ZE4",
  companyId: "biz_1ZH7VJrbsBzY1D"
});

// Fetch all receipts with pagination to avoid complexity limits
export async function fetchAllReceipts(
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<WhopReceipt[]> {
  try {
    const allReceipts: WhopReceipt[] = [];
    let hasNextPage = true;
    const pageSize = 25; // Smaller page size to reduce complexity

    while (hasNextPage) {
      const params: any = {
        companyId,
        first: pageSize,
        after: "pageInfo.endCursor",
        filter: {
          accessPassIds: ['plan_2546926'],
          statuses: ['succeeded'],
          billingReasons: ['one_time', 'subscription', 'subscription_cycle']
        }
      };

      // Convert date strings to Unix timestamps if provided
      if (startDate) {
        params.filter!.startDate = Math.floor(new Date(startDate).getTime() / 1000);
      }
      if (endDate) {
        params.filter!.endDate = Math.floor(new Date(endDate).getTime() / 1000);
      }

      const response = await whopSdk.payments.listReceiptsForCompany(params);
      const receipts = response?.receipts?.nodes || [];
      const pageInfo = response?.receipts?.pageInfo;
      
      allReceipts.push(...receipts.filter(receipt => receipt !== null) as WhopReceipt[]);
      
      hasNextPage = pageInfo?.hasNextPage || false;
      
      // Safety check to prevent infinite loops
      if (allReceipts.length > 1000) {
        console.warn('Reached maximum receipt limit (1000), stopping pagination');
        break;
      }
    }

    return allReceipts;
  } catch (error: any) {
    console.error(`Failed to fetch receipts for company ${companyId}:`, error.message);
    throw error;
  }
}
