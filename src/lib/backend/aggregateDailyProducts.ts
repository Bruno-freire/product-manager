import { ProductItem } from "@/app/types/ProductType";
import { compareListsOfProducts } from "./comparedLists";

export const aggregateDailyProducts = (lists: { createdAt: Date; products: ProductItem[] }[]): ProductItem[] => {
  if (lists.length === 0) return [];
  
  // Ordena as listas do dia de forma crescente pela data
  const sortedLists = lists.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  // Começa com a primeira lista do dia
  let aggregated: ProductItem[] = sortedLists[0].products;
  
  // Para cada nova lista do dia, atualiza o agregado
  for (let i = 1; i < sortedLists.length; i++) {
    const currentProducts = sortedLists[i].products;
    const comparison = compareListsOfProducts(aggregated, currentProducts, false);
    // Mantém os produtos que permaneceram e adiciona os novos (com entryDate da primeira aparição)
    aggregated = [...comparison.maintainedProducts, ...comparison.newProducts];
  }
  
  return aggregated;
};