"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testApiConnection = testApiConnection;
exports.fetchAllReceipts = fetchAllReceipts;
const api_1 = require("@whop/api");
const config_1 = require("./config");
const createWhopSdk = () => {
    return (0, api_1.WhopServerSdk)({
        appId: "app_3XIlzJF8UGUQ7O",
        appApiKey: config_1.config.whopApiKey || "AyjLw6hJTflHiwLUmbfiLPnOBUDHQfsQ8_DxinGudBk",
        onBehalfOfUserId: "user_89lYcdzn58ZE4",
        companyId: config_1.config.companyId || "biz_1ZH7VJrbsBzY1D"
    });
};
async function testApiConnection() {
    try {
        console.log('Testing API connection...');
        const sdk = createWhopSdk();
        console.log('Testing with getCurrentUser...');
        const user = await sdk.users.getCurrentUser();
        console.log('User response:', user);
        return true;
    }
    catch (error) {
        console.error('API connection test failed:', error);
        return false;
    }
}
async function fetchAllReceipts(companyId, startDate, endDate) {
    try {
        const isConnected = await testApiConnection();
        if (!isConnected) {
            throw new Error('API connection test failed');
        }
        console.log('API connection successful, now trying receipts...');
        const params = {
            companyId,
            first: 10
        };
        const filters = {};
        filters.statuses = ['succeeded'];
        filters.billingReasons = ['one_time', 'subscription', 'subscription_cycle'];
        if (startDate) {
            filters.startDate = Math.floor(new Date(startDate).getTime() / 1000);
        }
        if (endDate) {
            filters.endDate = Math.floor(new Date(endDate).getTime() / 1000);
        }
        if (Object.keys(filters).length > 0) {
            params.filter = filters;
        }
        console.log('Making API request with params:', JSON.stringify(params, null, 2));
        const sdk = createWhopSdk();
        const response = await sdk.payments.listReceiptsForCompany(params);
        console.log('Receipts API Response:', response);
        const receipts = response?.receipts?.nodes || [];
        return receipts.filter((receipt) => receipt !== null);
    }
    catch (error) {
        console.error(`Failed to fetch receipts for company ${companyId}:`, error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            response: error.response
        });
        throw error;
    }
}
//# sourceMappingURL=whopApi.js.map