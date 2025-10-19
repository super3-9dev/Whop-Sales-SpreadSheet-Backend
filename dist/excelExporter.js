"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDailySales = exportDailySales;
const exceljs_1 = __importDefault(require("exceljs"));
async function exportDailySales(dailyData, summaryStats, outputFile) {
    const workbook = new exceljs_1.default.Workbook();
    const dailySheet = workbook.addWorksheet('Daily Sales');
    dailySheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Total Sales', key: 'totalSales', width: 15 },
        { header: 'Total Cash', key: 'totalCash', width: 15 },
        { header: 'Average Per Sale', key: 'averagePerSale', width: 20 }
    ];
    dailyData.forEach((data) => {
        dailySheet.addRow({
            date: data.date,
            totalSales: data.totalSales,
            totalCash: data.totalCash.toFixed(2),
            averagePerSale: data.averagePerSale.toFixed(2)
        });
    });
    const headerRow = dailySheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 }
    ];
    summarySheet.addRow({ metric: 'Total Sales', value: summaryStats.totalSales });
    summarySheet.addRow({ metric: 'Paid Sales', value: summaryStats.totalPaidSales });
    summarySheet.addRow({ metric: 'Total Cash Collected', value: `$${summaryStats.totalCash.toFixed(2)}` });
    summarySheet.addRow({ metric: 'Average Sale Amount', value: `$${summaryStats.averageSaleAmount.toFixed(2)}` });
    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true };
    summaryHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    await workbook.xlsx.writeFile(outputFile);
    console.log(`Excel file created: ${outputFile}`);
}
//# sourceMappingURL=excelExporter.js.map