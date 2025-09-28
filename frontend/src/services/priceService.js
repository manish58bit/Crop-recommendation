// Sample crop price data for demonstration
export const cropPrices = {
    rice: {
        name: 'Rice',
        pricePerKg: 45,
        pricePerQuintal: 4500,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    wheat: {
        name: 'Wheat',
        pricePerKg: 28,
        pricePerQuintal: 2800,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    maize: {
        name: 'Maize',
        pricePerKg: 22,
        pricePerQuintal: 2200,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    sugarcane: {
        name: 'Sugarcane',
        pricePerKg: 3.5,
        pricePerQuintal: 350,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    cotton: {
        name: 'Cotton',
        pricePerKg: 85,
        pricePerQuintal: 8500,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    potato: {
        name: 'Potato',
        pricePerKg: 18,
        pricePerQuintal: 1800,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    tomato: {
        name: 'Tomato',
        pricePerKg: 35,
        pricePerQuintal: 3500,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    onion: {
        name: 'Onion',
        pricePerKg: 25,
        pricePerQuintal: 2500,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    soybean: {
        name: 'Soybean',
        pricePerKg: 55,
        pricePerQuintal: 5500,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    },
    groundnut: {
        name: 'Groundnut',
        pricePerKg: 65,
        pricePerQuintal: 6500,
        currency: 'INR',
        unit: 'kg',
        lastUpdated: '2024-01-15',
        market: 'Mandi',
        quality: 'Grade A'
    }
};

// Function to get price for a specific crop
export const getCropPrice = (cropName) => {
    const normalizedName = cropName.toLowerCase().replace(/\s+/g, '');
    return cropPrices[normalizedName] || null;
};

// Function to calculate profit based on yield and price
export const calculateProfit = (cropName, yieldInKg, costPerKg = 0) => {
    const priceData = getCropPrice(cropName);
    if (!priceData) return null;

    const totalRevenue = yieldInKg * priceData.pricePerKg;
    const totalCost = yieldInKg * costPerKg;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
        cropName: priceData.name,
        yield: yieldInKg,
        pricePerKg: priceData.pricePerKg,
        totalRevenue,
        totalCost,
        profit,
        profitMargin,
        currency: priceData.currency
    };
};

// Function to get all crop prices
export const getAllCropPrices = () => {
    return Object.values(cropPrices);
};

// Function to format price for display
export const formatPrice = (price, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(price);
};
