export interface Supplier {
  id: string;
  supplierName: string;
  primaryCategory: string;
  contactPerson: string;
  phoneEmail: string;
  paymentTerms: string;
  status: "Active" | "Inactive";
}

export interface PurchaseLog {
  dateReceived: string;
  refNumber: string;
  supplier: string;
  itemsSummary: string;
  receivingBranch: string;
  totalCost: number;
  receivedBy: string;
}

export interface ReceivedItem {
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface ActiveSupplier {
  supplierName: string;
  category: string;
  contactPerson: string;
  leadTime: string;
  status: "Active" | "Inactive";
}

