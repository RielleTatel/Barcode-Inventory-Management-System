export type CateringStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PackageType = 'basic' | 'silver' | 'gold' | 'premium' | 'custom';

export interface CateringDish {
  id: number;
  sku: string;
  name: string;
  price: string;
  menu_category_name: string;
}

export interface CateringDishWithRecipes extends CateringDish {
  recipes: { ingredient_name: string; quantity_required: string; unit: string }[];
}

export interface CateringEvent {
  id: number;
  client_name: string;
  contact_number: string;
  event_date: string;
  venue: string;
  pax: number;
  package_type: PackageType;
  package_type_display: string;
  items_ordered: number[];
  items_ordered_details?: CateringDish[];
  items_ordered_names?: string[];
  status: CateringStatus;
  status_display: string;
  prep_branch: number | null;
  prep_branch_name: string;
  notes: string;
  kitchen_sheet_number: string;
  created_at: string;
  updated_at: string;
}

export interface KitchenSheet {
  id: number;
  client_name: string;
  contact_number: string;
  event_date: string;
  venue: string;
  pax: number;
  package_type: PackageType;
  package_type_display: string;
  status: CateringStatus;
  status_display: string;
  prep_branch: number | null;
  prep_branch_name: string;
  notes: string;
  kitchen_sheet_number: string;
  items_with_recipes: CateringDishWithRecipes[];
  created_at: string;
}

export interface CateringFormData {
  client_name: string;
  contact_number: string;
  event_date: string;
  venue: string;
  pax: string;
  package_type: PackageType;
  items_ordered: number[];
  status: CateringStatus;
  prep_branch: number | null;
  notes: string;
}

export const PACKAGE_OPTIONS: { value: PackageType; label: string; color: string }[] = [
  { value: 'basic',   label: 'Basic',   color: 'bg-gray-100 text-gray-700' },
  { value: 'silver',  label: 'Silver',  color: 'bg-slate-100 text-slate-700' },
  { value: 'gold',    label: 'Gold',    color: 'bg-amber-100 text-amber-700' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-100 text-purple-700' },
  { value: 'custom',  label: 'Custom',  color: 'bg-blue-100 text-blue-700' },
];

export const STATUS_OPTIONS: { value: CateringStatus; label: string; color: string }[] = [
  { value: 'pending',   label: 'Pending',   color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

export const CATERING_QUERY_KEYS = {
  EVENTS: ['cateringEvents'],
  DISHES: ['cateringDishes'],
} as const;
