export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate to USD
}

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 150 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 460 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.5 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.4 },
];

export const dateFormats = [
  { code: 'MM/DD/YYYY', name: 'MM/DD/YYYY (US Format)' },
  { code: 'DD/MM/YYYY', name: 'DD/MM/YYYY (European Format)' },
  { code: 'YYYY-MM-DD', name: 'YYYY-MM-DD (ISO Format)' },
  { code: 'DD-MM-YYYY', name: 'DD-MM-YYYY' },
  { code: 'MM-DD-YYYY', name: 'MM-DD-YYYY' },
];

export const timezones = [
  { code: 'America/New_York', name: 'Eastern Time (ET)' },
  { code: 'America/Chicago', name: 'Central Time (CT)' },
  { code: 'America/Denver', name: 'Mountain Time (MT)' },
  { code: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
  { code: 'Europe/London', name: 'Greenwich Mean Time (GMT)' },
  { code: 'Europe/Paris', name: 'Central European Time (CET)' },
  { code: 'Africa/Nairobi', name: 'East Africa Time (EAT)' },
  { code: 'Africa/Lagos', name: 'West Africa Time (WAT)' },
  { code: 'Asia/Tokyo', name: 'Japan Standard Time (JST)' },
  { code: 'Asia/Shanghai', name: 'China Standard Time (CST)' },
];

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  const convertedAmount = amount * currency.rate;
  
  return `${currency.symbol}${convertedAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const formatDate = (date: Date, format: string): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'MM-DD-YYYY':
      return `${month}-${day}-${year}`;
    default:
      return date.toLocaleDateString();
  }
};