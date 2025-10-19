import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config, isDevelopment } from './config';
import { fetchAllReceipts } from './whopApi';
import { aggregateByDay, getSummaryStats } from './salesAggregator';
import { exportDailySales } from './excelExporter';
import { 
  GenerateReportRequest, 
  GenerateReportResponse, 
  ApiStatusResponse,
  ConfigResponse,
  ApiError 
} from './types';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/api/status', (_req: Request, res: Response<ApiStatusResponse>) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/api/generate-report', async (req: Request<{}, GenerateReportResponse, GenerateReportRequest>, res: Response<GenerateReportResponse>): Promise<void> => {
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

    if (!config.whopApiKey) {
      res.status(400).json({
        success: false,
        message: 'API key not configured'
      });
      return;
    }

    if (!config.companyId) {
      res.status(400).json({
        success: false,
        message: 'Company ID not configured'
      });
      return;
    }

    console.log(`Generating report for ${startDate} to ${endDate}`);

    // Fetch receipts data
    const allReceipts = await fetchAllReceipts(config.companyId, startDate, endDate);
    
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

    // Aggregate data
    const dailyData = aggregateByDay(allReceipts);
    const summaryStats = getSummaryStats(allReceipts);

    // Generate Excel file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = `daily_sales_${timestamp}.xlsx`;
    
    await exportDailySales(dailyData, summaryStats, outputFile);

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        dailySales: dailyData,
        summary: summaryStats
      },
      file: outputFile
    });

  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: `Failed to generate report: ${error.message}`
    });
  }
});

app.get('/api/download/:filename', (req: Request<{ filename: string }>, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      error: 'File not found'
    });
    return;
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

app.get('/api/config', (_req: Request, res: Response<ConfigResponse>) => {
  res.json({
    configured: !!(config.whopApiKey && config.companyId),
    checkoutIdsCount: 0, // No longer using checkout IDs
    hasApiKey: !!config.whopApiKey
  });
});

// Error handling middleware
app.use((error: Error, _req: Request, res: Response<ApiError>, _next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req: Request, res: Response<ApiError>) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Backend server running on http://localhost:${config.port}`);
  console.log(`🔗 API endpoints available at http://localhost:${config.port}/api`);
  console.log(`📊 Health check: http://localhost:${config.port}/api/status`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
  console.log(`🔑 API Key configured: ${!!config.whopApiKey}`);
  console.log(`🏢 Company ID: ${config.companyId}`);
});

export default app;
