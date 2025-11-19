// app/lib/backend/comparedLists.ts
import { ProductItem } from '@/app/types/ProductType';

/**
 * Compara duas listas de produtos e retorna novos, mantidos e removidos.
 * 
 * @param oldListRaw - lista anterior
 * @param newListRaw - lista atual
 * @param shouldUpdateEntryDate - se true, produtos mantidos terão entryDate atualizado para Date.now
 */
export const compareListsOfProducts = (
  oldListRaw: ProductItem[],
  newListRaw: ProductItem[],
  shouldUpdateEntryDate = true
) => {
  const oldMap = new Map(oldListRaw.map((p) => [p.code, p]));
  const newMap = new Map(newListRaw.map((p) => [p.code, p]));

  // Novos produtos (não existiam antes)
  const newProducts = newListRaw
    .filter((p) => !oldMap.has(p.code))
    .map((p) => ({
      ...p,
      entryDate: new Date().toISOString(),
    }));

  // Produtos mantidos
  const maintainedProducts = newListRaw
    .filter((p) => oldMap.has(p.code))
    .map((p) => ({
      ...p,
      amount: p.amount,
      entryDate: shouldUpdateEntryDate
        ? new Date().toISOString()
        : oldMap.get(p.code)!.entryDate,
    }));

  // Produtos removidos
  const removedProducts = oldListRaw
    .filter((p) => !newMap.has(p.code))
    .map((p) => ({
      ...p,
      entryDate: oldMap.get(p.code)?.entryDate ?? new Date().toISOString(),
    }));

  return {
    newProducts,
    maintainedProducts,
    removedProducts,
  };
};
