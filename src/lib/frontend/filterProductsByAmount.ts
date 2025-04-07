import { ComparedProduct } from "@/app/types/comparedTypes";
export type FilterType = "all" | "greater" | "equal" | "less";
const parseAmount = (amountStr: string): number => {
  return parseFloat(amountStr.replace(",", "."));
};

export const filterProductsByAmount = (
  products: ComparedProduct[],
  filter: FilterType
) => {
  switch (filter) {
    case "greater":
      return products.filter((p) => parseAmount(p.amount) > 0);
    case "equal":
      return products.filter((p) => parseAmount(p.amount) === 0);
    case "less":
      return products.filter((p) => parseAmount(p.amount) < 0);
    default:
      return products;
  }
};