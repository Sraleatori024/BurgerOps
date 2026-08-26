import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Ingredient,
  Product,
  Recipe,
  Purchase,
  Order,
  Customer,
  Supplier,
  ShopSettings,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  DeliveryAddress,
} from '../types';
import {
  initialIngredients,
  initialProducts,
  initialRecipes,
  initialPurchases,
  initialOrders,
  initialCustomers,
  initialSuppliers,
  initialShopSettings,
} from '../data/initialData';
import { calculateRecipeCost, convertToBaseUnit } from '../utils/calculations';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'recipes'
  | 'inventory'
  | 'purchases'
  | 'yield'
  | 'pricing'
  | 'simulator'
  | 'restock'
  | 'customers'
  | 'reports'
  | 'settings';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  activeView: 'customer' | 'admin';
  setActiveView: (view: 'customer' | 'admin') => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;

  // Data
  ingredients: Ingredient[];
  products: Product[];
  recipes: Recipe[];
  purchases: Purchase[];
  orders: Order[];
  customers: Customer[];
  suppliers: Supplier[];
  settings: ShopSettings;

  // Cart & Customer Flow
  cart: OrderItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  selectedProductForCustomization: Product | null;
  setSelectedProductForCustomization: (product: Product | null) => void;
  activeOrderTracker: Order | null;
  setActiveOrderTracker: (order: Order | null) => void;

  // Actions
  addToCart: (item: OrderItem) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  submitCustomerOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    deliveryAddress?: DeliveryAddress;
    paymentMethod: PaymentMethod;
    notes?: string;
    changeFor?: number;
    deliveryFee: number;
    discount?: number;
  }) => Order;

  // Admin Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  adjustIngredientStock: (id: string, newStock: number, reason?: string) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'unitCostCalculated'>) => void;
  saveRecipe: (recipe: Recipe) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateSettings: (newSettings: ShopSettings) => void;
  resetToDemoData: () => void;

  // Feedback
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  ingredientsMap: Record<string, Ingredient>;
  recipesMap: Record<string, Recipe>;
  productsMap: Record<string, Product>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ING: 'burgerops_ingredients_v1',
  PROD: 'burgerops_products_v1',
  REC: 'burgerops_recipes_v1',
  PUR: 'burgerops_purchases_v1',
  ORD: 'burgerops_orders_v1',
  CUST: 'burgerops_customers_v1',
  SUPP: 'burgerops_suppliers_v1',
  SETT: 'burgerops_settings_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
  }
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<'customer' | 'admin'>('customer');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    loadFromStorage(STORAGE_KEYS.ING, initialIngredients)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage(STORAGE_KEYS.PROD, initialProducts)
  );
  const [recipes, setRecipes] = useState<Recipe[]>(() =>
    loadFromStorage(STORAGE_KEYS.REC, initialRecipes)
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() =>
    loadFromStorage(STORAGE_KEYS.PUR, initialPurchases)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage(STORAGE_KEYS.ORD, initialOrders)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage(STORAGE_KEYS.CUST, initialCustomers)
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    loadFromStorage(STORAGE_KEYS.SUPP, initialSuppliers)
  );
  const [settings, setSettings] = useState<ShopSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETT, initialShopSettings)
  );

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<Product | null>(null);
  const [activeOrderTracker, setActiveOrderTracker] = useState<Order | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ING, JSON.stringify(ingredients));
  }, [ingredients]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROD, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REC, JSON.stringify(recipes));
  }, [recipes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PUR, JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORD, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUST, JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPP, JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETT, JSON.stringify(settings));
  }, [settings]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  // Lookup maps for fast computation
  const ingredientsMap = React.useMemo(() => {
    return ingredients.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, Ingredient>);
  }, [ingredients]);

  const recipesMap = React.useMemo(() => {
    return recipes.reduce((acc, item) => {
      acc[item.productId] = item;
      return acc;
    }, {} as Record<string, Recipe>);
  }, [recipes]);

  const productsMap = React.useMemo(() => {
    return products.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, Product>);
  }, [products]);

  // Cart operations
  const addToCart = (item: OrderItem) => {
    setCart((prev) => [...prev, item]);
    showToast(`"${item.productName}" adicionado ao carrinho!`, 'success');
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removido do carrinho', 'info');
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const unitPrice = item.unitPrice;
          return {
            ...item,
            quantity,
            totalPrice: unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Automated Inventory Consumption & Order Submission
  const submitCustomerOrder = (orderPayload: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    deliveryAddress?: DeliveryAddress;
    paymentMethod: PaymentMethod;
    notes?: string;
    changeFor?: number;
    deliveryFee: number;
    discount?: number;
  }): Order => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = orderPayload.discount || 0;
    const total = subtotal + orderPayload.deliveryFee - discount;

    // Calculate total cost from recipes and ingredients
    let totalCost = 0;
    const ingredientsToDeduct: Record<string, number> = {};

    cart.forEach((orderItem) => {
      const recipe = recipesMap[orderItem.productId];
      const productCostCalc = calculateRecipeCost(recipe, ingredientsMap);
      const singleItemCost = productCostCalc.costWithLoss || orderItem.unitCost || 0;
      totalCost += singleItemCost * orderItem.quantity;

      // Track ingredient consumption
      if (recipe && recipe.items) {
        recipe.items.forEach((recItem) => {
          const ing = ingredientsMap[recItem.ingredientId];
          if (ing) {
            const neededQty = recItem.quantity * orderItem.quantity;
            ingredientsToDeduct[ing.id] = (ingredientsToDeduct[ing.id] || 0) + neededQty;
          }
        });
      }

      // Track addons consumption
      if (orderItem.selectedAddons) {
        orderItem.selectedAddons.forEach((addon) => {
          if (addon.ingredientId && addon.quantity) {
            const neededQty = addon.quantity * orderItem.quantity;
            ingredientsToDeduct[addon.ingredientId] = (ingredientsToDeduct[addon.ingredientId] || 0) + neededQty;
          }
        });
      }
    });

    const grossProfit = Number((total - totalCost).toFixed(2));

    const nextOrderNumber = 1000 + orders.length + 1;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: `#${nextOrderNumber}`,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      orderType: orderPayload.orderType,
      deliveryAddress: orderPayload.deliveryAddress,
      items: [...cart],
      subtotal,
      deliveryFee: orderPayload.deliveryFee,
      discount,
      total,
      totalCost: Number(totalCost.toFixed(2)),
      grossProfit,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: 'pago',
      status: 'novo',
      notes: orderPayload.notes,
      changeFor: orderPayload.changeFor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Apply inventory deduction automatically
    setIngredients((prevIngredients) => {
      return prevIngredients.map((ing) => {
        const deducted = ingredientsToDeduct[ing.id];
        if (deducted !== undefined && deducted > 0) {
          const newQty = Math.max(0, Number((ing.stockQuantity - deducted).toFixed(3)));
          return {
            ...ing,
            stockQuantity: newQty,
          };
        }
        return ing;
      });
    });

    // Update or create Customer CRM record
    setCustomers((prevCustomers) => {
      const existingIndex = prevCustomers.findIndex(
        (c) => c.phone.replace(/\D/g, '') === orderPayload.customerPhone.replace(/\D/g, '')
      );
      if (existingIndex >= 0) {
        const existing = prevCustomers[existingIndex];
        const newTotalSpent = Number((existing.totalSpent + total).toFixed(2));
        const newCount = (existing.totalOrders || existing.ordersCount || 0) + 1;
        const segment = newCount >= 5 ? 'vip' : 'recorrente';
        const updated = [...prevCustomers];
        updated[existingIndex] = {
          ...existing,
          name: orderPayload.customerName || existing.name,
          address: orderPayload.deliveryAddress
            ? `${orderPayload.deliveryAddress.street}, ${orderPayload.deliveryAddress.number}`
            : existing.address,
          totalSpent: newTotalSpent,
          totalOrders: newCount,
          ordersCount: newCount,
          lastOrderAt: new Date().toISOString().split('T')[0],
          lastOrderDate: new Date().toISOString().split('T')[0],
          segment,
        };
        return updated;
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: orderPayload.customerName,
          phone: orderPayload.customerPhone,
          address: orderPayload.deliveryAddress
            ? `${orderPayload.deliveryAddress.street}, ${orderPayload.deliveryAddress.number}`
            : undefined,
          neighborhood: orderPayload.deliveryAddress?.neighborhood,
          totalSpent: total,
          totalOrders: 1,
          ordersCount: 1,
          lastOrderAt: new Date().toISOString().split('T')[0],
          lastOrderDate: new Date().toISOString().split('T')[0],
          segment: 'novo',
        };
        return [newCust, ...prevCustomers];
      }
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setCartOpen(false);
    setActiveOrderTracker(newOrder);
    showToast(`Pedido ${newOrder.code} criado com sucesso! Baixa no estoque efetuada.`, 'success');

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              updatedAt: new Date().toISOString(),
            }
          : ord
      )
    );
    showToast(`Status do pedido atualizado para "${status.replace('_', ' ').toUpperCase()}"`, 'success');
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'cancelado',
              updatedAt: new Date().toISOString(),
            }
          : ord
      )
    );
    showToast('Pedido cancelado.', 'warning');
  };

  const addIngredient = (ingredientData: Omit<Ingredient, 'id'>) => {
    const newIngredient: Ingredient = {
      ...ingredientData,
      id: `ing-${Date.now()}`,
    };
    setIngredients((prev) => [...prev, newIngredient]);
    showToast(`Ingrediente "${newIngredient.name}" cadastrado!`, 'success');
  };

  const updateIngredient = (updated: Ingredient) => {
    setIngredients((prev) => prev.map((ing) => (ing.id === updated.id ? updated : ing)));
    showToast(`Ingrediente "${updated.name}" atualizado!`, 'success');
  };

  const adjustIngredientStock = (id: string, newStock: number, reason?: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id
          ? {
              ...ing,
              stockQuantity: Number(newStock.toFixed(3)),
            }
          : ing
      )
    );
    showToast(`Estoque ajustado para ${newStock} (${reason || 'Ajuste manual'})`, 'info');
  };

  // Add purchase: recalculates unit cost and increases stock automatically
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Update ingredient stock & cost for all items
    setIngredients((prev) => {
      const itemsMap = newPurchase.items.reduce((acc, item) => {
        acc[item.ingredientId] = item;
        return acc;
      }, {} as Record<string, typeof newPurchase.items[0]>);

      return prev.map((ing) => {
        const item = itemsMap[ing.id];
        if (item) {
          const newStock = Number((ing.stockQuantity + item.quantity).toFixed(3));
          return {
            ...ing,
            stockQuantity: newStock,
            unitCost: item.unitCost,
            lastPurchasePrice: item.totalCost,
            lastPurchaseDate: newPurchase.date,
            supplier: newPurchase.supplier || ing.supplier,
          };
        }
        return ing;
      });
    });

    showToast(
      `Compra de ${newPurchase.items.length} item(ns) registrada! Estoque e CMV atualizados com sucesso.`,
      'success'
    );
  };

  const saveRecipe = (recipe: Recipe) => {
    setRecipes((prev) => {
      const idx = prev.findIndex((r) => r.productId === recipe.productId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = recipe;
        return updated;
      }
      return [...prev, recipe];
    });
    showToast('Ficha técnica salva com sucesso!', 'success');
  };

  const saveProduct = (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [...prev, product];
    });
    showToast(`Produto "${product.name}" salvo com sucesso!`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setRecipes((prev) => prev.filter((r) => r.productId !== productId));
    showToast('Produto removido do catálogo.', 'info');
  };

  const updateSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
    showToast('Configurações atualizadas!', 'success');
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setIngredients(initialIngredients);
    setProducts(initialProducts);
    setRecipes(initialRecipes);
    setPurchases(initialPurchases);
    setOrders(initialOrders);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSettings(initialShopSettings);
    setCart([]);
    showToast('Dados de demonstração reiniciados com sucesso!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        adminTab,
        setAdminTab,
        ingredients,
        products,
        recipes,
        purchases,
        orders,
        customers,
        suppliers,
        settings,
        cart,
        cartOpen,
        setCartOpen,
        selectedProductForCustomization,
        setSelectedProductForCustomization,
        activeOrderTracker,
        setActiveOrderTracker,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        submitCustomerOrder,
        updateOrderStatus,
        cancelOrder,
        addIngredient,
        updateIngredient,
        adjustIngredientStock,
        addPurchase,
        saveRecipe,
        saveProduct,
        deleteProduct,
        updateSettings,
        resetToDemoData,
        toast,
        showToast,
        ingredientsMap,
        recipesMap,
        productsMap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
