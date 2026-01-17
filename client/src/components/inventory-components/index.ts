export interface stockData {
    sku: number; 
    itemName: string; 
    category: string; 
    stockLevel: number;
    unit: number; 
    status: string; 
    actions: () => void; 
} 

