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
        const allReceipts = await (0, whopApi_1.fetchAllReceipts)(config_1.config.companyId, startDate, endDate);
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