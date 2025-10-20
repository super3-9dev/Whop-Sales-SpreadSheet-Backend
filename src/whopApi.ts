import { WhopReceipt } from './types';
import { WhopServerSdk } from '@whop/api';
import Whop from '@whop/sdk';
import dotenv from 'dotenv';
dotenv.config();

const APP_ID = process.env['APP_ID'] || '';
const API_KEY = process.env['API_KEY'] || ''; 
const APP_API_KEY = process.env['APPAPIKEY'] || '';
const ON_BEHALF_OF_USER_ID = process.env['USERID'] || '';
const COMPANY_ID = process.env['COMPANY_ID'] || '';

export const whopSdk: WhopServerSdk = WhopServerSdk({
  appId: APP_ID,
  appApiKey: APP_API_KEY,
  onBehalfOfUserId: ON_BEHALF_OF_USER_ID,
  companyId: COMPANY_ID
});

// Initialize Whop SDK for product creation
export const whopClient = new Whop({
  appID: APP_ID,
  apiKey: APP_API_KEY,
  baseURL: 'https://whop-sales-spread-sheet-frontend.vercel.app/',
});

// Fetch all receipts with pagination to avoid complexity limits
export async function fetchAllReceipts(
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<WhopReceipt[]> {
  try {
    const allReceipts: WhopReceipt[] = [];
    const pageSize = 25; // Smaller page size to reduce complexity

    // while (hasNextPage) {
      const params: any = {
        companyId,
        first: pageSize,
        // after: "pageInfo.endCursor",
        filter: {
          accessPassIds: ["prod_w1SblC5hEu81B"],
          endDate: endDate ? Math.floor(new Date(endDate).getTime() / 1000) : undefined,
          order: "created_at",
          startDate: startDate ? Math.floor(new Date(startDate).getTime() / 1000) : undefined,
          statuses: [
            "failed", "succeeded"
          ],
        },
      };

      // Convert date strings to Unix timestamps if provided
      if (startDate) {
        params.filter!.startDate = Math.floor(new Date(startDate).getTime() / 1000);
      }
      if (endDate) {
        params.filter!.endDate = Math.floor(new Date(endDate).getTime() / 1000);
      }
      const response = await whopSdk.payments.listReceiptsForCompany(params);
      console.log(JSON.stringify(response, null, 2));
      const receipts = response?.receipts?.nodes || [];
      
      allReceipts.push(...receipts.filter(receipt => receipt !== null) as WhopReceipt[]);
      
      // Safety check to prevent infinite loops
    //   if (allReceipts.length > 1000) {
    //     console.warn('Reached maximum receipt limit (1000), stopping pagination');
    //     break;
    //   }
    // }

    return allReceipts;
  } catch (error: any) {
    console.error(`Failed to fetch receipts for company ${companyId}:`, error.message);
    throw error;
  }
}

// Create a product
export async function createProduct(
  title: string,
  // description?: string 
): Promise<any> {
  try {
    console.log('Creating product:', title);
    
    const product = await whopClient.products.create({
      company_id: COMPANY_ID,
      title: title
    });

    console.log('Product created successfully:', product.id);
    return product;
  } catch (error: any) {
    console.error(`Failed to create product:`, error.message);
    throw error;
  }
}

// Create a checkout link with internal name
export async function createCheckoutLink(
  productId: string,
  internalName: string,
  title: string,
  price: string = "10.00",
  currency: string = "usd"
): Promise<any> {
  try {
    console.log(`Creating checkout link for product ${productId} with internal name: ${internalName}`);
    
    const result = await whopSdk.payments.createCheckoutSession({
      plan: {
        companyId: COMPANY_ID,
        productId: productId,
        title: title,
        description: `Checkout link: ${internalName}`,
        planType: "one_time" as const,
        initialPrice: price,
        currency: currency as any,
        releaseMethod: "buy_now" as const,
        visibility: "visible" as const,
        internalNotes: `Internal name: ${internalName}` // Store internal name in internal notes
      },
      metadata: {
        internalName: internalName,
        createdAt: new Date().toISOString()
      }
    } as any); // Type assertion to handle API changes

    console.log('Checkout link created successfully:', result?.id);
    return {
      ...result,
      internalName: internalName,
      title: title,
      price: price,
      currency: currency
    };
  } catch (error: any) {
    console.error(`Failed to create checkout link for ${internalName}:`, error.message);
    throw error;
  }
}

// Create multiple checkout links with random internal names
export async function createMultipleCheckoutLinks(
  productId: string,
  count: number = 10
): Promise<any[]> {
  try {
    console.log(`Creating ${count} checkout links for product ${productId}`);
    
    const checkoutLinks = [];
    const internalNames = generateRandomInternalNames(count);
    
    for (let i = 0; i < count; i++) {
      const internalName = internalNames[i]!; // Non-null assertion since we know the array has the right length
      const title = `Plan ${i + 1} - ${internalName}`;
      const price = (Math.random() * 50 + 10).toFixed(2); // Random price between $10-$60
      
      try {
        const checkoutLink = await createCheckoutLink(
          productId,
          internalName,
          title,
          price,
          "usd"
        );
        checkoutLinks.push(checkoutLink);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to create checkout link ${i + 1}:`, error);
        // Continue with other links even if one fails
      }
    }
    
    console.log(`Successfully created ${checkoutLinks.length} checkout links`);
    return checkoutLinks;
  } catch (error: any) {
    console.error('Failed to create multiple checkout links:', error.message);
    throw error;
  }
}

// Generate random internal names
function generateRandomInternalNames(count: number): string[] {
  const prefixes = ['premium', 'basic', 'pro', 'starter', 'advanced', 'ultimate', 'standard', 'deluxe', 'express', 'max'];
  const suffixes = ['plan', 'package', 'deal', 'offer', 'bundle', 'kit', 'suite', 'edition', 'version', 'tier'];
  
  const names = new Set<string>();
  
  while (names.size < count) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    const name = `${prefix}_${suffix}_${number}`;
    names.add(name);
  }
  
  return Array.from(names);
}

// Track checkout links by internal name
export async function trackCheckoutLinksByInternalName(
  internalName: string,
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  try {
    console.log(`Tracking checkout links for internal name: ${internalName}`);
    
    // Fetch all receipts
    const allReceipts = await fetchAllReceipts(COMPANY_ID, startDate, endDate);
    
    // Filter receipts that contain the internal name in metadata or internal notes
    const trackedReceipts = allReceipts.filter(receipt => {
      // Check if receipt plan title contains the internal name
      if (receipt.plan && receipt.plan.title && receipt.plan.title.includes(internalName)) {
        return true;
      }
      
      // Check if receipt has metadata with internal name (using any type for flexibility)
      const receiptAny = receipt as any;
      if (receiptAny.metadata && typeof receiptAny.metadata === 'object') {
        const metadata = receiptAny.metadata;
        if (metadata.internalName === internalName) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`Found ${trackedReceipts.length} receipts for internal name: ${internalName}`);
    return trackedReceipts;
  } catch (error: any) {
    console.error(`Failed to track checkout links for ${internalName}:`, error.message);
    throw error;
  }
}

// Get all checkout links with their internal names
export async function getAllCheckoutLinks(): Promise<any[]> {
  try {
    console.log('Fetching all checkout links...');
    
    // This would typically fetch from a database or API
    // For now, we'll return a placeholder since we don't have a direct API to list checkout links
    // In a real implementation, you'd store these in a database when creating them
    
    return [];
  } catch (error: any) {
    console.error('Failed to get checkout links:', error.message);
    throw error;
  }
}
