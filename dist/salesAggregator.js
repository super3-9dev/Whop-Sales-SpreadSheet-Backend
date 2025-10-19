"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateByDay = aggregateByDay;
exports.getSummaryStats = getSummaryStats;
function aggregateByDay(receipts) {
    const dailyMap = new Map();
    receipts.forEach((receipt) => {
        const saleDate = new Date(receipt.createdAt * 1000).toISOString().split('T')[0];
        const amount = receipt.settledUsdAmount || receipt.totalUsdAmount || 0;
        const isPaid = receipt.status === 'paid' || receipt.friendlyStatus === 'succeeded';
        if (!saleDate)
            return;
        if (!dailyMap.has(saleDate)) {
            dailyMap.set(saleDate, {
                totalSales: 0,
                totalCash: 0,
                paidSales: 0
            });
        }
        const dayData = dailyMap.get(saleDate);
        if (!dayData)
            return;
        dayData.totalSales += 1;
        if (isPaid) {
            dayData.totalCash += amount;
            dayData.paidSales += 1;
        }
    });
    return Array.from(dailyMap.entries())
        .map(([date, data]) => ({
        date,
        totalSales: data.totalSales,
        totalCash: data.totalCash,
        averagePerSale: data.totalCash / data.totalSales || 0
    }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
function getSummaryStats(receipts) {
    const statusBreakdown = {};
    let totalCash = 0;
    let paidSales = 0;
    receipts.forEach((receipt) => {
        const status = receipt.friendlyStatus || receipt.status;
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        const isPaid = receipt.status === 'paid' || receipt.friendlyStatus === 'succeeded';
        if (isPaid) {
            totalCash += receipt.settledUsdAmount || receipt.totalUsdAmount || 0;
            paidSales++;
        }
    });
    return {
        totalSales: receipts.length,
        totalPaidSales: paidSales,
        totalCash,
        averageSaleAmount: paidSales > 0 ? totalCash / paidSales : 0,
        statusBreakdown
    };
}
//# sourceMappingURL=salesAggregator.js.map