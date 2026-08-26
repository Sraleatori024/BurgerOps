import { Ingredient, Recipe, UnitType, YieldAnalysis, Product } from '../types';

/**
 * Standard unit converter to a common base (grams, milliliters, units)
 */
export function convertToBaseUnit(quantity: number, unit: UnitType): { value: number; base: 'g' | 'ml' | 'un' } {
  switch (unit) {
    case 'kg':
      return { value: quantity * 1000, base: 'g' };
    case 'g':
      return { value: quantity, base: 'g' };
    case 'l':
      return { value: quantity * 1000, base: 'ml' };
    case 'ml':
      return { value: quantity, base: 'ml' };
    case 'un':
    case 'fatia':
    case 'lata':
    case 'pct':
    default:
      return { value: quantity, base: 'un' };
  }
}

/**
 * Calculate the cost of an ingredient portion based on the ingredient's unit & unitCost
 */
export function calculateIngredientPortionCost(
  ingredient: Ingredient,
  portionQuantity: number,
  portionUnit: UnitType
): number {
  if (!ingredient || ingredient.unitCost <= 0 || portionQuantity <= 0) return 0;

  // If units match exactly
  if (ingredient.unit === portionUnit) {
    return portionQuantity * ingredient.unitCost;
  }

  // Handle kg / g
  if (ingredient.unit === 'kg' && portionUnit === 'g') {
    return (portionQuantity / 1000) * ingredient.unitCost;
  }
  if (ingredient.unit === 'g' && portionUnit === 'kg') {
    return portionQuantity * 1000 * ingredient.unitCost;
  }

  // Handle l / ml
  if (ingredient.unit === 'l' && portionUnit === 'ml') {
    return (portionQuantity / 1000) * ingredient.unitCost;
  }
  if (ingredient.unit === 'ml' && portionUnit === 'l') {
    return portionQuantity * 1000 * ingredient.unitCost;
  }

  // Fallback direct multiplier
  return portionQuantity * ingredient.unitCost;
}

/**
 * Calculate the total direct cost of a recipe, including loss %
 */
export function calculateRecipeCost(recipe: Recipe | undefined, ingredientsMap: Record<string, Ingredient>): {
  baseCost: number;
  costWithLoss: number;
  lossValue: number;
  itemCosts: Array<{
    ingredientId: string;
    name: string;
    quantity: number;
    unit: UnitType;
    unitCost: number;
    cost: number;
    percentageOfTotal: number;
  }>;
} {
  if (!recipe || !recipe.items || recipe.items.length === 0) {
    return { baseCost: 0, costWithLoss: 0, lossValue: 0, itemCosts: [] };
  }

  let baseCost = 0;
  const itemCosts: Array<{
    ingredientId: string;
    name: string;
    quantity: number;
    unit: UnitType;
    unitCost: number;
    cost: number;
    percentageOfTotal: number;
  }> = [];

  for (const item of recipe.items) {
    const ing = ingredientsMap[item.ingredientId];
    const cost = ing ? calculateIngredientPortionCost(ing, item.quantity, item.unit) : 0;
    baseCost += cost;
    itemCosts.push({
      ingredientId: item.ingredientId,
      name: ing ? ing.name : 'Insumo não encontrado',
      quantity: item.quantity,
      unit: item.unit,
      unitCost: ing ? ing.unitCost : 0,
      cost,
      percentageOfTotal: 0,
    });
  }

  // Calculate percentage share
  for (const item of itemCosts) {
    item.percentageOfTotal = baseCost > 0 ? (item.cost / baseCost) * 100 : 0;
  }

  const lossPct = Math.max(0, recipe.lossPercentage || 0);
  const lossMultiplier = 1 + lossPct / 100;
  const costWithLoss = baseCost * lossMultiplier;
  const lossValue = costWithLoss - baseCost;

  return {
    baseCost,
    costWithLoss,
    lossValue,
    itemCosts,
  };
}

/**
 * Calculate yields and bottleneck ingredient for an entire product recipe
 */
export function calculateRecipeProductionCapacity(
  recipe: Recipe | undefined,
  ingredientsMap: Record<string, Ingredient>
): {
  maxSellablePortions: number;
  limitingIngredient?: {
    id: string;
    name: string;
    availableStock: number;
    stockUnit: UnitType;
    neededPerPortion: number;
    portionUnit: UnitType;
    canProduce: number;
  };
  breakdown: Array<{
    ingredientId: string;
    name: string;
    stock: number;
    stockUnit: UnitType;
    needed: number;
    neededUnit: UnitType;
    possiblePortions: number;
  }>;
} {
  if (!recipe || !recipe.items || recipe.items.length === 0) {
    return { maxSellablePortions: 0, breakdown: [] };
  }

  let minPortions = Infinity;
  let limiting: any = null;
  const breakdown: any[] = [];

  for (const item of recipe.items) {
    const ing = ingredientsMap[item.ingredientId];
    if (!ing) {
      minPortions = 0;
      breakdown.push({
        ingredientId: item.ingredientId,
        name: 'Insumo desconhecido',
        stock: 0,
        stockUnit: item.unit,
        needed: item.quantity,
        neededUnit: item.unit,
        possiblePortions: 0,
      });
      continue;
    }

    const stockConv = convertToBaseUnit(ing.stockQuantity, ing.unit);
    const itemConv = convertToBaseUnit(item.quantity, item.unit);

    let possible = 0;
    if (stockConv.base === itemConv.base && itemConv.value > 0) {
      // Apply loss reduction to stock if any
      const effectiveStock = stockConv.value * (1 - (recipe.lossPercentage || 0) / 100);
      possible = Math.max(0, Math.floor(effectiveStock / itemConv.value));
    }

    breakdown.push({
      ingredientId: ing.id,
      name: ing.name,
      stock: ing.stockQuantity,
      stockUnit: ing.unit,
      needed: item.quantity,
      neededUnit: item.unit,
      possiblePortions: possible,
    });

    if (possible < minPortions) {
      minPortions = possible;
      limiting = {
        id: ing.id,
        name: ing.name,
        availableStock: ing.stockQuantity,
        stockUnit: ing.unit,
        neededPerPortion: item.quantity,
        portionUnit: item.unit,
        canProduce: possible,
      };
    }
  }

  return {
    maxSellablePortions: minPortions === Infinity ? 0 : minPortions,
    limitingIngredient: limiting,
    breakdown,
  };
}

/**
 * Calculate single ingredient yield metrics (e.g. 5kg batata / 300g portion)
 */
export function calculateSingleIngredientYield(
  totalStock: number,
  stockUnit: UnitType,
  portionQuantity: number,
  portionUnit: UnitType,
  lossPercentage: number = 0,
  unitCost: number = 0,
  salePricePerPortion: number = 0
): {
  theoreticalPortions: number;
  sellablePortions: number;
  remainingStock: number;
  costPerPortion: number;
  totalPotentialRevenue: number;
  totalPotentialCost: number;
  estimatedGrossProfit: number;
  marginPercent: number;
} {
  const stockBase = convertToBaseUnit(totalStock, stockUnit);
  const portionBase = convertToBaseUnit(portionQuantity, portionUnit);

  if (portionBase.value <= 0 || stockBase.base !== portionBase.base) {
    return {
      theoreticalPortions: 0,
      sellablePortions: 0,
      remainingStock: totalStock,
      costPerPortion: 0,
      totalPotentialRevenue: 0,
      totalPotentialCost: 0,
      estimatedGrossProfit: 0,
      marginPercent: 0,
    };
  }

  const effectiveStock = stockBase.value * (1 - lossPercentage / 100);
  const theoreticalPortions = effectiveStock / portionBase.value;
  const sellablePortions = Math.floor(theoreticalPortions);

  // Remaining stock in base unit
  const usedBase = sellablePortions * portionBase.value;
  const remainingBase = Math.max(0, stockBase.value - usedBase);
  const remainingStock = stockUnit === 'kg' || stockUnit === 'l' ? remainingBase / 1000 : remainingBase;

  // Cost per portion
  const portionRatio = portionBase.value / (stockUnit === 'kg' || stockUnit === 'l' ? 1000 : 1);
  const costPerPortion = portionRatio * unitCost;

  const totalPotentialRevenue = sellablePortions * salePricePerPortion;
  const totalPotentialCost = totalStock * unitCost;
  const estimatedGrossProfit = totalPotentialRevenue - totalPotentialCost;
  const marginPercent = totalPotentialRevenue > 0 ? (estimatedGrossProfit / totalPotentialRevenue) * 100 : 0;

  return {
    theoreticalPortions: Number(theoreticalPortions.toFixed(2)),
    sellablePortions,
    remainingStock: Number(remainingStock.toFixed(2)),
    costPerPortion: Number(costPerPortion.toFixed(2)),
    totalPotentialRevenue: Number(totalPotentialRevenue.toFixed(2)),
    totalPotentialCost: Number(totalPotentialCost.toFixed(2)),
    estimatedGrossProfit: Number(estimatedGrossProfit.toFixed(2)),
    marginPercent: Number(marginPercent.toFixed(1)),
  };
}

/**
 * Calculate financial profit and margin
 */
export function calculateProfit(salePrice: number, cost: number): number {
  return Number((salePrice - cost).toFixed(2));
}

export function calculateMargin(salePrice: number, cost: number): number {
  if (salePrice <= 0) return 0;
  return Number((((salePrice - cost) / salePrice) * 100).toFixed(1));
}

export function calculateMarkup(salePrice: number, cost: number): number {
  if (cost <= 0) return 0;
  return Number((((salePrice - cost) / cost) * 100).toFixed(1));
}

/**
 * Intelligent Pricing Calculator with detailed fee breakdown
 */
export function calculateSmartPricing(
  productCost: number,
  desiredMarginPercent: number = 50,
  cardFeePercent: number = 2.5,
  deliveryAppFeePercent: number = 0,
  otherVariableCostPercent: number = 0,
  packagingAndLogisticsCost: number = 1.0
): {
  suggestedPrice: number;
  totalCostWithVariable: number;
  netProfit: number;
  netMarginPercent: number;
  markupPercent: number;
  deductionsBreakdown: {
    baseCost: number;
    packagingCost: number;
    cardFeeValue: number;
    deliveryAppFeeValue: number;
    otherVariableFeeValue: number;
    totalDeductions: number;
  };
} {
  const effectiveCost = productCost + packagingAndLogisticsCost;
  const totalVariablePercentage = (desiredMarginPercent + cardFeePercent + deliveryAppFeePercent + otherVariableCostPercent);

  let suggestedPrice = 0;
  if (totalVariablePercentage < 100) {
    suggestedPrice = effectiveCost / (1 - totalVariablePercentage / 100);
  } else {
    suggestedPrice = effectiveCost * (1 + desiredMarginPercent / 100);
  }

  // Round smartly to nearest .90 or .00 for commercial feel
  suggestedPrice = Number(suggestedPrice.toFixed(2));

  const cardFeeValue = Number(((suggestedPrice * cardFeePercent) / 100).toFixed(2));
  const deliveryAppFeeValue = Number(((suggestedPrice * deliveryAppFeePercent) / 100).toFixed(2));
  const otherVariableFeeValue = Number(((suggestedPrice * otherVariableCostPercent) / 100).toFixed(2));

  const totalDeductions = Number(
    (productCost + packagingAndLogisticsCost + cardFeeValue + deliveryAppFeeValue + otherVariableFeeValue).toFixed(2)
  );
  const netProfit = Number((suggestedPrice - totalDeductions).toFixed(2));
  const netMarginPercent = suggestedPrice > 0 ? Number(((netProfit / suggestedPrice) * 100).toFixed(1)) : 0;
  const markupPercent = effectiveCost > 0 ? Number((((suggestedPrice - effectiveCost) / effectiveCost) * 100).toFixed(1)) : 0;

  return {
    suggestedPrice,
    totalCostWithVariable: totalDeductions,
    netProfit,
    netMarginPercent,
    markupPercent,
    deductionsBreakdown: {
      baseCost: productCost,
      packagingCost: packagingAndLogisticsCost,
      cardFeeValue,
      deliveryAppFeeValue,
      otherVariableFeeValue,
      totalDeductions,
    },
  };
}

/**
 * Simple Yield simulation helper
 */
export function calculateYield(
  totalQuantity: number,
  portionSize: number,
  totalCost: number,
  portionSalePrice: number
): {
  portions: number;
  leftover: number;
  costPerPortion: number;
  potentialRevenue: number;
  potentialProfit: number;
  profitMargin: number;
} {
  if (portionSize <= 0 || totalQuantity <= 0) {
    return {
      portions: 0,
      leftover: totalQuantity,
      costPerPortion: 0,
      potentialRevenue: 0,
      potentialProfit: 0,
      profitMargin: 0,
    };
  }

  const portions = Math.floor(totalQuantity / portionSize);
  const leftover = Math.max(0, totalQuantity - portions * portionSize);
  const costPerPortion = portions > 0 ? totalCost / portions : 0;
  const potentialRevenue = portions * portionSalePrice;
  const potentialProfit = potentialRevenue - totalCost;
  const profitMargin = potentialRevenue > 0 ? (potentialProfit / potentialRevenue) * 100 : 0;

  return {
    portions,
    leftover: Number(leftover.toFixed(3)),
    costPerPortion: Number(costPerPortion.toFixed(2)),
    potentialRevenue: Number(potentialRevenue.toFixed(2)),
    potentialProfit: Number(potentialProfit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(1)),
  };
}

/**
 * Suggested pricing helper with multi-channel fees
 */
export function calculateSuggestedPrice(
  recipeCost: number,
  packagingCost: number,
  operationalCost: number,
  cardFeePercentage: number,
  appFeePercentage: number,
  desiredMarginPercentage: number
): {
  suggestedPrice: number;
  totalCost: number;
  cardFeeValue: number;
  appFeeValue: number;
  netProfit: number;
  effectiveMargin: number;
  markupMultiplier: number;
} {
  const directCost = recipeCost + packagingCost + operationalCost;
  const totalVariableRate = (cardFeePercentage + appFeePercentage + desiredMarginPercentage) / 100;

  let suggestedPrice = 0;
  if (totalVariableRate < 0.95) {
    suggestedPrice = directCost / (1 - totalVariableRate);
  } else {
    suggestedPrice = directCost * (1 + desiredMarginPercentage / 100);
  }

  suggestedPrice = Number(suggestedPrice.toFixed(2));
  const cardFeeValue = Number(((suggestedPrice * cardFeePercentage) / 100).toFixed(2));
  const appFeeValue = Number(((suggestedPrice * appFeePercentage) / 100).toFixed(2));
  const netProfit = Number((suggestedPrice - directCost - cardFeeValue - appFeeValue).toFixed(2));
  const effectiveMargin = suggestedPrice > 0 ? Number(((netProfit / suggestedPrice) * 100).toFixed(1)) : 0;
  const markupMultiplier = directCost > 0 ? Number((suggestedPrice / directCost).toFixed(2)) : 1;

  return {
    suggestedPrice,
    totalCost: directCost,
    cardFeeValue,
    appFeeValue,
    netProfit,
    effectiveMargin,
    markupMultiplier,
  };
}

/**
 * Format currency to standard Brazilian Real
 */
export function formatBRL(value: number | undefined | null): string {

  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format quantity with unit (e.g. 5,2 kg, 300 g, 50 un)
 */
export function formatQty(quantity: number, unit: UnitType): string {
  const formattedNum = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(quantity);
  return `${formattedNum} ${unit}`;
}
