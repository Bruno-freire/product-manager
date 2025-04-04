import { ProductItem } from '@/app/types/ProductType';

export const compareListsOfProducts = (
  oldListRaw: ProductItem[],
  newListRaw: ProductItem[],
  shouldUpdateEntryDate = true
) => {
  const oldMap = new Map(oldListRaw.map((p) => [p.code, p]));
  const newMap = new Map(newListRaw.map((p) => [p.code, p]));

  const newProducts = newListRaw
    .filter((p) => !oldMap.has(p.code))
    .map((p) => ({
      ...p,
      entryDate: shouldUpdateEntryDate
        ? new Date().toISOString()
        : p.entryDate ?? new Date().toISOString(), // fallback se vier undefined
    }));

  const maintainedProducts = oldListRaw
    .filter((p) => newMap.has(p.code))
    .map((p) => ({
      ...p,
      entryDate: p.entryDate,
    }));

  const removedProducts = oldListRaw.filter((p) => !newMap.has(p.code));

  return {
    newProducts,
    maintainedProducts,
    removedProducts,
  };
};
