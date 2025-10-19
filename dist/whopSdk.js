"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhopSdk = void 0;
class WhopSdk {
    constructor(config) {
        this.baseURL = 'https://api.whop.com/api/v2';
        this.apiKey = config.apiKey;
    }
    async listReceiptsForCompany(params) {
        try {
            const query = this.buildGraphQLQuery(params);
            const response = await fetch(`${this.baseURL}/graphql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        companyId: params.companyId,
                        first: params.first || 100,
                        after: params.after,
                        filter: params.filter
                    }
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
            }
            return data.data;
        }
        catch (error) {
            console.error('Error fetching receipts from Whop API:', error.message);
            throw error;
        }
    }
    buildGraphQLQuery(_params) {
        return `
      query ListReceiptsForCompany($companyId: String!, $first: Int, $after: String, $filter: ReceiptFilter) {
        receipts: listReceiptsForCompany(companyId: $companyId, first: $first, after: $after, filter: $filter) {
          nodes {
            id
            address {
              name
              line1
              line2
              city
              state
              postalCode
              country
            }
            settledUsdAmount
            billingReason
            last4
            currency
            status
            createdAt
            total
            brand
            paymentProcessor
            paymentMethodType
            disputeAlertedAt
            finalAmount
            presentedFinalAmount
            presentedSettledUsdAmount
            refundedAmount
            friendlyStatus
            failureMessage
            refundable
            retryable
            paidAt
            amountAfterFees
            chargeSkippedPriceTooLow
            lastPaymentAttempt
            autoRefunded
            member {
              header
              user {
                id
                username
                name
                email
                country
                countryName
              }
              imageSrcset {
                original
                double
                isVideo
              }
            }
            plan {
              id
              title
              formattedPrice
              initialPrice
              renewalPrice
              paymentLinkDescription
            }
            membership {
              id
              status
            }
            promoCode {
              id
              code
              amountOff
              baseCurrency
              promoType
              numberOfIntervals
            }
            accessPass {
              id
              title
            }
            totalUsdAmount
            mostRecentRiskScore
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    }
}
exports.WhopSdk = WhopSdk;
//# sourceMappingURL=whopSdk.js.map