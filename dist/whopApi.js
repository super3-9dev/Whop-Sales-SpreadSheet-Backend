"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whopClient = exports.whopSdk = void 0;
exports.fetchAllReceipts = fetchAllReceipts;
exports.createProduct = createProduct;
exports.createCheckoutLink = createCheckoutLink;
exports.createMultipleCheckoutLinks = createMultipleCheckoutLinks;
exports.trackCheckoutLinksByInternalName = trackCheckoutLinksByInternalName;
exports.getAllCheckoutLinks = getAllCheckoutLinks;
const api_1 = require("@whop/api");
const sdk_1 = __importDefault(require("@whop/sdk"));
exports.whopSdk = (0, api_1.WhopServerSdk)({
    appId: "app_yi6VozkdipMtUI",
    appApiKey: "ZAY4nts6i0t14TrY-FTrTHXXz__E7kRyU1YjvE2GTrM",
    onBehalfOfUserId: "user_753tM9RWnM1At",
    companyId: "biz_1ZH7VJrbsBzY1D"
});
exports.whopClient = new sdk_1.default({
    appID: "app_yi6VozkdipMtUI",
    apiKey: "ZAY4nts6i0t14TrY-FTrTHXXz__E7kRyU1YjvE2GTrM",
});
async function fetchAllReceipts(companyId, startDate, endDate) {
    try {
        const allReceipts = [];
        let hasNextPage = true;
        const pageSize = 25;
        const params = {
            companyId,
            first: pageSize,
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
        if (startDate) {
            params.filter.startDate = Math.floor(new Date(startDate).getTime() / 1000);
        }
        if (endDate) {
            params.filter.endDate = Math.floor(new Date(endDate).getTime() / 1000);
        }
        const response = await exports.whopSdk.payments.listReceiptsForCompany(params);
        console.log(JSON.stringify(response, null, 2));
        const receipts = response?.receipts?.nodes || [];
        const pageInfo = response?.receipts?.pageInfo;
        allReceipts.push(...receipts.filter(receipt => receipt !== null));
        hasNextPage = pageInfo?.hasNextPage || false;
        return allReceipts;
    }
    catch (error) {
        console.error(`Failed to fetch receipts for company ${companyId}:`, error.message);
        throw error;
    }
}
async function createProduct(title, description) {
    try {
        console.log('Creating product:', title);
        const product = await exports.whopClient.products.create({
            company_id: "biz_1ZH7VJrbsBzY1D",
            title: title,
            description: description || `Product: ${title}`,
            visibility: 'visible',
            business_type: 'education_program',
            industry_type: 'trading'
        });
        console.log('Product created successfully:', product.id);
        return product;
    }
    catch (error) {
        console.error(`Failed to create product:`, error.message);
        throw error;
    }
}
async function createCheckoutLink(productId, internalName, title, price = "10.00", currency = "usd") {
    try {
        console.log(`Creating checkout link for product ${productId} with internal name: ${internalName}`);
        const result = await exports.whopSdk.payments.createCheckoutSession({
            plan: {
                companyId: "biz_1ZH7VJrbsBzY1D",
                productId: productId,
                title: title,
                description: `Checkout link: ${internalName}`,
                planType: "one_time",
                initialPrice: price,
                currency: currency,
                releaseMethod: "buy_now",
                visibility: "visible",
                internalNotes: `Internal name: ${internalName}`
            },
            metadata: {
                internalName: internalName,
                createdAt: new Date().toISOString()
            }
        });
        console.log('Checkout link created successfully:', result?.id);
        return {
            ...result,
            internalName: internalName,
            title: title,
            price: price,
            currency: currency
        };
    }
    catch (error) {
        console.error(`Failed to create checkout link for ${internalName}:`, error.message);
        throw error;
    }
}
async function createMultipleCheckoutLinks(productId, count = 10) {
    try {
        console.log(`Creating ${count} checkout links for product ${productId}`);
        const checkoutLinks = [];
        const internalNames = generateRandomInternalNames(count);
        for (let i = 0; i < count; i++) {
            const internalName = internalNames[i];
            const title = `Plan ${i + 1} - ${internalName}`;
            const price = (Math.random() * 50 + 10).toFixed(2);
            try {
                const checkoutLink = await createCheckoutLink(productId, internalName, title, price, "usd");
                checkoutLinks.push(checkoutLink);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            catch (error) {
                console.error(`Failed to create checkout link ${i + 1}:`, error);
            }
        }
        console.log(`Successfully created ${checkoutLinks.length} checkout links`);
        return checkoutLinks;
    }
    catch (error) {
        console.error('Failed to create multiple checkout links:', error.message);
        throw error;
    }
}
function generateRandomInternalNames(count) {
    const prefixes = ['premium', 'basic', 'pro', 'starter', 'advanced', 'ultimate', 'standard', 'deluxe', 'express', 'max'];
    const suffixes = ['plan', 'package', 'deal', 'offer', 'bundle', 'kit', 'suite', 'edition', 'version', 'tier'];
    const names = new Set();
    while (names.size < count) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const number = Math.floor(Math.random() * 999) + 1;
        const name = `${prefix}_${suffix}_${number}`;
        names.add(name);
    }
    return Array.from(names);
}
async function trackCheckoutLinksByInternalName(internalName, startDate, endDate) {
    try {
        console.log(`Tracking checkout links for internal name: ${internalName}`);
        const allReceipts = await fetchAllReceipts("biz_1ZH7VJrbsBzY1D", startDate, endDate);
        const trackedReceipts = allReceipts.filter(receipt => {
            if (receipt.plan && receipt.plan.title && receipt.plan.title.includes(internalName)) {
                return true;
            }
            const receiptAny = receipt;
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
    }
    catch (error) {
        console.error(`Failed to track checkout links for ${internalName}:`, error.message);
        throw error;
    }
}
async function getAllCheckoutLinks() {
    try {
        console.log('Fetching all checkout links...');
        return [];
    }
    catch (error) {
        console.error('Failed to get checkout links:', error.message);
        throw error;
    }
}
//# sourceMappingURL=whopApi.js.map