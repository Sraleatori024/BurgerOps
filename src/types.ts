export type UnitType = 'kg' | 'g' | 'l' | 'ml' | 'un' | 'fatia' | 'lata' | 'pct';

export type IngredientCategory =
  | 'carnes'
  | 'paes'
  | 'queijos'
  | 'hortifruti'
  | 'molhos'
  | 'acompanhamentos'
  | 'embalagens'
  | 'bebidas'
  | 'sobremesas'
  | 'outros';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: UnitType;
  stockQuantity: number;
  minStock: number;
  lastPurchasePrice: number;
  unitCost: number; // Cost in Brazilian Reais per defined unit
  supplier?: string;
  lastPurchaseDate?: string;
  expirationDate?: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // quantity in the ingredient's unit (or g/ml equivalent)
  unit: UnitType;
}

export interface Recipe {
  id: string;
  productId: string;
  lossPercentage: number; // e.g. 5 means 5% loss in grill/waste
  preparationTimeMinutes: number;
  items: RecipeItem[];
  instructions?: string;
}

export type ProductCategory =
  | 'hamburgueres'
  | 'porcoes'
  | 'bebidas'
  | 'sobremesas'
  | 'combos'
  | 'adicionais';

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
  ingredientId?: string;
  ingredientQuantity?: number;
  unit?: UnitType;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  preparationTimeMinutes?: number;
  availableAddons?: ProductAddon[];
  removableIngredients?: string[];
}

export interface OrderItemAddon {
  name: string;
  price: number;
  ingredientId?: string;
  quantity?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  selectedAddons?: OrderItemAddon[];
  removedIngredients?: string[];
  notes?: string;
  totalPrice: number;
}

export type OrderStatus =
  | 'novo'
  | 'confirmado'
  | 'em_preparacao'
  | 'pronto'
  | 'saiu_entrega'
  | 'entregue'
  | 'cancelado';

export type OrderType = 'entrega' | 'retirada' | 'mesa';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';

export interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  city?: string;
  reference?: string;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  totalCost: number;
  grossProfit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pago' | 'pendente';
  status: OrderStatus;
  notes?: string;
  changeFor?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitType;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  invoiceNumber?: string;
  date: string;
  items: PurchaseItem[];
  totalValue: number;
  notes?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: any;
  neighborhood?: string;
  totalSpent: number;
  totalOrders: number;
  ordersCount?: number;
  lastOrderAt: string;
  lastOrderDate?: string;
  notes?: string;
  segment?: 'novo' | 'recorrente' | 'vip' | 'inativo';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  category: string;
  city?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  address: string;
  openingHours: string;
  defaultDeliveryFee: number;
  targetMarginPercent: number;
  cardFeePercent: number;
  deliveryAppFeePercent: number;
  fixedOverheadPercent: number;
  lossTolerancePercent: number;
  currencySymbol: string;
}

export interface YieldAnalysis {
  productId: string;
  productName: string;
  portionQuantity: number;
  portionUnit: UnitType;
  availableStock: number;
  theoreticalPortions: number;
  sellablePortions: number;
  remainingStock: number;
  limitingIngredientName?: string;
  lossPercentage: number;
  unitCost: number;
  unitPrice: number;
  potentialRevenue: number;
  potentialCost: number;
  potentialProfit: number;
}
