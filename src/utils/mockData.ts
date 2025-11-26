// Mock data generator for metrics
export const generateDailyData = (days: number = 7) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10000) + 5000,
    });
  }
  
  return data;
};

export const generateMonthlyData = (months: number = 3) => {
  const data = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    data.push({
      date: monthName,
      value: Math.floor(Math.random() * 100000) + 50000,
    });
  }
  
  return data;
};

export const calculateSum = (data: Array<{ value: number }>) => {
  return data.reduce((sum, item) => sum + item.value, 0);
};

export const calculateMean = (data: Array<{ value: number }>) => {
  if (data.length === 0) return 0;
  return calculateSum(data) / data.length;
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const metricNames = [
  "Active Total",
  "Active New",
  "Active Existing",
  "Active Existing Transacting",
  "Active New Transacting",
  "Active Micro Merchants",
  "Active Unified Merchants",
  "Active App Users",
  "App Downloads",
  "Non-Gross Adds",
  "Gross Adds",
  "Top Up",
];
