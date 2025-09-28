// Currency conversion utilities for USD-BDT system

export interface CurrencyDisplay {
  usd: string;
  bdt: string;
  usdRaw: number;
  bdtRaw: number;
}

export interface ExchangeRate {
  rate: number; // Exchange rate in paisa (14500 = 145.00 BDT per USD)
  baseCurrency: string;
  displayCurrency: string;
}

/**
 * Convert BDT paisa to USD cents
 * @param bdtPaisa Amount in BDT paisa (100 paisa = 1 BDT)
 * @param exchangeRate Exchange rate in paisa (e.g., 14500 = 145.00 BDT per USD)
 * @returns Amount in USD cents (100 cents = 1 USD)
 */
export function bdtToUsd(bdtPaisa: number, exchangeRate: number): number {
  // Convert BDT paisa to BDT, then to USD, then to USD cents
  const bdtAmount = bdtPaisa / 100; // Convert paisa to BDT
  const exchangeRateInBdt = exchangeRate / 100; // Convert paisa to BDT exchange rate
  const usdAmount = bdtAmount / exchangeRateInBdt; // Convert to USD
  return Math.round(usdAmount * 100); // Convert to cents and round
}

/**
 * Convert USD cents to BDT paisa
 * @param usdCents Amount in USD cents (100 cents = 1 USD)
 * @param exchangeRate Exchange rate in paisa (e.g., 14500 = 145.00 BDT per USD)
 * @returns Amount in BDT paisa (100 paisa = 1 BDT)
 */
export function usdToBdt(usdCents: number, exchangeRate: number): number {
  // Convert USD cents to USD, then to BDT, then to BDT paisa
  const usdAmount = usdCents / 100; // Convert cents to USD
  const exchangeRateInBdt = exchangeRate / 100; // Convert paisa to BDT exchange rate
  const bdtAmount = usdAmount * exchangeRateInBdt; // Convert to BDT
  return Math.round(bdtAmount * 100); // Convert to paisa and round
}

/**
 * Format currency amount to display string
 * @param amount Amount in smallest unit (paisa/cents)
 * @param currency Currency code (USD/BDT)
 * @returns Formatted string
 */
export function formatCurrency(amount: number, currency: string = 'BDT'): string {
  const displayAmount = amount / 100; // Convert to main unit
  
  if (currency === 'USD') {
    return `$${displayAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  } else {
    return `৳${displayAmount.toLocaleString('bn-BD', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  }
}

/**
 * Create dual currency display object
 * @param bdtPaisa Amount in BDT paisa
 * @param exchangeRate Exchange rate in paisa
 * @returns CurrencyDisplay object with both USD and BDT formatted strings
 */
export function createDualCurrencyDisplay(bdtPaisa: number, exchangeRate: number): CurrencyDisplay {
  const usdCents = bdtToUsd(bdtPaisa, exchangeRate);
  
  return {
    usd: formatCurrency(usdCents, 'USD'),
    bdt: formatCurrency(bdtPaisa, 'BDT'),
    usdRaw: usdCents / 100, // USD in dollars
    bdtRaw: bdtPaisa / 100  // BDT in taka
  };
}

/**
 * Calculate USD amount from BDT input and exchange rate
 * @param bdtInput BDT amount as entered by user (in taka, not paisa)
 * @param exchangeRate Exchange rate in paisa
 * @returns USD amount in dollars (not cents)
 */
export function calculateUsdFromBdtInput(bdtInput: number, exchangeRate: number): number {
  const bdtPaisa = Math.round(bdtInput * 100); // Convert taka to paisa
  const usdCents = bdtToUsd(bdtPaisa, exchangeRate);
  return usdCents / 100; // Return in dollars
}

/**
 * Calculate BDT amount from USD input and exchange rate
 * @param usdInput USD amount as entered by user (in dollars, not cents)
 * @param exchangeRate Exchange rate in paisa
 * @returns BDT amount in taka (not paisa)
 */
export function calculateBdtFromUsdInput(usdInput: number, exchangeRate: number): number {
  const usdCents = Math.round(usdInput * 100); // Convert dollars to cents
  const bdtPaisa = usdToBdt(usdCents, exchangeRate);
  return bdtPaisa / 100; // Return in taka
}

/**
 * Default exchange rate fallback
 */
export const DEFAULT_USD_RATE = 14500; // 145.00 BDT per USD in paisa