"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const whopApi_1 = require("./whopApi");
const salesAggregator_1 = require("./salesAggregator");
const excelExporter_1 = require("./excelExporter");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true
}));
app.use(express_1.default.json());
app.get('/api/status', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.post('/api/generate-report', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        console.log(startDate, endDate);
        if (!startDate || !endDate) {
            res.status(400).json({
                success: false,
                message: 'Both startDate and endDate are required'
            });
            return;
        }
        if (!config_1.config.whopApiKey) {
            res.status(400).json({
                success: false,
                message: 'API key not configured'
            });
            return;
        }
        if (!config_1.config.companyId) {
            res.status(400).json({
                success: false,
                message: 'Company ID not configured'
            });
            return;
        }
        console.log(`Generating report for ${startDate} to ${endDate}`);
        const allReceipts = await (0, whopApi_1.fetchAllReceipts)(config_1.config.companyId);
        if (allReceipts.length === 0) {
            res.json({
                success: true,
                message: 'No receipt data found for the specified criteria',
                data: {
                    dailySales: [],
                    summary: {
                        totalSales: 0,
                        totalPaidSales: 0,
                        totalCash: 0,
                        averageSaleAmount: 0,
                        statusBreakdown: {}
                    }
                }
            });
            return;
        }
        const dailyData = (0, salesAggregator_1.aggregateByDay)(allReceipts);
        const summaryStats = (0, salesAggregator_1.getSummaryStats)(allReceipts);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFile = `daily_sales_${timestamp}.xlsx`;
        await (0, excelExporter_1.exportDailySales)(dailyData, summaryStats, outputFile);
        res.json({
            success: true,
            message: 'Report generated successfully',
            data: {
                dailySales: dailyData,
                summary: summaryStats
            },
            file: outputFile
        });
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: `Failed to generate report: ${error.message}`
        });
    }
});
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path_1.default.join(__dirname, '..', filename);
    if (!fs_1.default.existsSync(filePath)) {
        res.status(404).json({
            error: 'File not found'
        });
        return;
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
});
app.get('/api/config', (_req, res) => {
    res.json({
        configured: !!(config_1.config.whopApiKey && config_1.config.companyId),
        checkoutIdsCount: 0,
        hasApiKey: !!config_1.config.whopApiKey
    });
});
app.post('/api/create-product', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            res.status(400).json({
                success: false,
                message: 'Title is required'
            });
            return;
        }
        const product = await (0, whopApi_1.createProduct)(title, description);
        res.json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});
app.post('/api/create-checkout-link', async (req, res) => {
    try {
        const { productId, internalName, title, price, currency } = req.body;
        if (!productId || !internalName || !title) {
            res.status(400).json({
                success: false,
                message: 'productId, internalName, and title are required'
            });
            return;
        }
        const checkoutLink = await (0, whopApi_1.createCheckoutLink)(productId, internalName, title, price, currency);
        res.json({
            success: true,
            message: 'Checkout link created successfully',
            data: checkoutLink
        });
    }
    catch (error) {
        console.error('Error creating checkout link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout link',
            error: error.message
        });
    }
});
app.post('/api/create-multiple-checkout-links', async (req, res) => {
    try {
        const { productId, count } = req.body;
        if (!productId) {
            res.status(400).json({
                success: false,
                message: 'productId is required'
            });
            return;
        }
        const checkoutLinks = await (0, whopApi_1.createMultipleCheckoutLinks)(productId, count || 10);
        res.json({
            success: true,
            message: `Successfully created ${checkoutLinks.length} checkout links`,
            data: checkoutLinks
        });
    }
    catch (error) {
        console.error('Error creating multiple checkout links:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create multiple checkout links',
            error: error.message
        });
    }
});
app.post('/api/track-checkout-links', async (req, res) => {
    try {
        const { internalName, startDate, endDate } = req.body;
        if (!internalName) {
            res.status(400).json({
                success: false,
                message: 'internalName is required'
            });
            return;
        }
        const trackedReceipts = await (0, whopApi_1.trackCheckoutLinksByInternalName)(internalName, startDate, endDate);
        res.json({
            success: true,
            message: `Found ${trackedReceipts.length} receipts for internal name: ${internalName}`,
            data: trackedReceipts
        });
    }
    catch (error) {
        console.error('Error tracking checkout links:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track checkout links',
            error: error.message
        });
    }
});
app.post('/api/complete-workflow', async (req, res) => {
    try {
        const { productTitle, productDescription, checkoutCount } = req.body;
        if (!productTitle) {
            res.status(400).json({
                success: false,
                message: 'productTitle is required'
            });
            return;
        }
        console.log('Starting complete workflow...');
        console.log('Step 1: Creating product...');
        const product = await (0, whopApi_1.createProduct)(productTitle, productDescription);
        console.log('Step 2: Creating checkout links...');
        const checkoutLinks = await (0, whopApi_1.createMultipleCheckoutLinks)(product.id, checkoutCount || 10);
        console.log('Step 3: Setting up tracking...');
        await (0, whopApi_1.getAllCheckoutLinks)();
        res.json({
            success: true,
            message: 'Complete workflow executed successfully',
            data: {
                product: product,
                checkoutLinks: checkoutLinks,
                trackingSetup: true,
                internalNames: checkoutLinks.map(link => link.internalName)
            }
        });
    }
    catch (error) {
        console.error('Error in complete workflow:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to execute complete workflow',
            error: error.message
        });
    }
});
app.use((error, _req, res, _next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: config_1.isDevelopment ? error.message : 'Something went wrong'
    });
});
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The endpoint ${req.method} ${req.path} does not exist`
    });
});
app.listen(config_1.config.port, () => {
    console.log(`🚀 Backend server running on http://localhost:${config_1.config.port}`);
    console.log(`🔗 API endpoints available at http://localhost:${config_1.config.port}/api`);
    console.log(`📊 Health check: http://localhost:${config_1.config.port}/api/status`);
    console.log(`🔧 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🔑 API Key configured: ${!!config_1.config.whopApiKey}`);
    console.log(`🏢 Company ID: ${config_1.config.companyId}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map