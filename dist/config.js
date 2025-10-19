"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevelopment = exports.isProduction = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env['PORT'] || 3000,
    nodeEnv: process.env['NODE_ENV'] || 'development',
    whopApiKey: process.env['API_KEY'] || '',
    companyId: process.env['COMPANY_ID'] || '',
    corsOrigin: process.env['CORS_ORIGIN'] || '*'
};
exports.isProduction = exports.config.nodeEnv === 'production';
exports.isDevelopment = exports.config.nodeEnv === 'development';
//# sourceMappingURL=config.js.map