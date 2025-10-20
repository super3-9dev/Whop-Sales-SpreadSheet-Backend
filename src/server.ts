import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config, isDevelopment } from './config';
import { 
  fetchAllReceipts, 
  createProduct, 
  createCheckoutLink, 
  createMultipleCheckoutLinks, 
  trackCheckoutLinksByInternalName,
  getAllCheckoutLinks
} from './whopApi';
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
    const allReceipts = await fetchAllReceipts(config.companyId);
    
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

// Create a product
app.post('/api/create-product', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      res.status(400).json({
        success: false,
        message: 'Title is required'
      });
      return;
    }

    const product = await createProduct(title, description);
    
    res.json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Create a single checkout link
app.post('/api/create-checkout-link', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, internalName, title, price, currency } = req.body;
    
    if (!productId || !internalName || !title) {
      res.status(400).json({
        success: false,
        message: 'productId, internalName, and title are required'
      });
      return;
    }

    const checkoutLink = await createCheckoutLink(productId, internalName, title, price, currency);
    
    res.json({
      success: true,
      message: 'Checkout link created successfully',
      data: checkoutLink
    });
  } catch (error: any) {
    console.error('Error creating checkout link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout link',
      error: error.message
    });
  }
});

// Create multiple checkout links
app.post('/api/create-multiple-checkout-links', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, count } = req.body;
    
    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'productId is required'
      });
      return;
    }

    const checkoutLinks = await createMultipleCheckoutLinks(productId, count || 10);
    
    res.json({
      success: true,
      message: `Successfully created ${checkoutLinks.length} checkout links`,
      data: checkoutLinks
    });
  } catch (error: any) {
    console.error('Error creating multiple checkout links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create multiple checkout links',
      error: error.message
    });
  }
});

// Track checkout links by internal name
app.post('/api/track-checkout-links', async (req: Request, res: Response): Promise<void> => {
  try {
    const { internalName, startDate, endDate } = req.body;
    
    if (!internalName) {
      res.status(400).json({
        success: false,
        message: 'internalName is required'
      });
      return;
    }

    const trackedReceipts = await trackCheckoutLinksByInternalName(internalName, startDate, endDate);
    
    res.json({
      success: true,
      message: `Found ${trackedReceipts.length} receipts for internal name: ${internalName}`,
      data: trackedReceipts
    });
  } catch (error: any) {
    console.error('Error tracking checkout links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track checkout links',
      error: error.message
    });
  }
});

// Complete workflow: Create product + checkout links + tracking
app.post('/api/complete-workflow', async (req: Request, res: Response): Promise<void> => {
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
    
    // Step 1: Create product
    console.log('Step 1: Creating product...');
    const product = await createProduct(productTitle, productDescription);
    console.log(product)
    // Step 2: Create checkout links
    console.log('Step 2: Creating checkout links...');
    const checkoutLinks = await createMultipleCheckoutLinks(product.id, checkoutCount || 10);
    
    // Step 3: Setup tracking
    console.log('Step 3: Setting up tracking...');
    await getAllCheckoutLinks();
    
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
  } catch (error: any) {
    console.error('Error in complete workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute complete workflow',
      error: error.message
    });
  }
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
