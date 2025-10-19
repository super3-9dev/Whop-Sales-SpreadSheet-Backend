import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env['PORT'] || 3000,
  nodeEnv: process.env['NODE_ENV'] || 'development',
  whopApiKey: process.env['API_KEY'] || '',
  companyId: process.env['COMPANY_ID'] || '',
  corsOrigin: process.env['CORS_ORIGIN'] || '*'
};

export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';
