import { ProductItem } from "@/app/types/ProductType";
import { compareListsOfProducts } from "./comparedLists";
import { prisma } from "./prisma";

export const processingListProduct = async (productList?: string) => {
  // ✅ Caso não tenha lista fornecida, compara as duas últimas do banco
  if (!productList) {
    const lastTwoLists = await prisma.list.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    if (lastTwoLists.length < 2) {
      return {
        newProducts: [],
        maintainedProducts: [],
        removedProducts: [],
      };
    }

    const [lastList, penultimateList] = lastTwoLists;
    const oldListProducts = penultimateList.products as ProductItem[];
    const newListProducts = lastList.products as ProductItem[];

    return compareListsOfProducts(oldListProducts, newListProducts, false);
  }

  // ✅ Caso uma nova lista seja recebida como string:
  const regex =
    /^(\d+)\s+(.+?)-\d+\s+.*?(\d{3}\.\d+\.\d+\.\d+ A)\s+(-?\d+,\d+)/gm;

  const results = [...productList.matchAll(regex)];

  const newProductList = results.map((result) => ({
    code: result[1].trim(),
    name: result[2].trim(),
    address: result[3].trim(),
    amount: result[4].trim(),
  }));

  const lastList = await prisma.list.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  let finalListToSave: ProductItem[] = [];
  let newProducts: ProductItem[] = [];
  let maintainedProducts: ProductItem[] = [];
  let removedProducts: ProductItem[] = [];

  if (!lastList) {
    // Primeira lista recebida no sistema
    const entryDate = new Date().toISOString();
    newProducts = newProductList.map((p) => ({
      ...p,
      entryDate,
    }));
    finalListToSave = newProducts;
  } else {
    const oldListProducts = lastList.products as ProductItem[];
    const comparison = compareListsOfProducts(oldListProducts, newProductList);

    newProducts = comparison.newProducts;
    maintainedProducts = comparison.maintainedProducts;
    removedProducts = comparison.removedProducts;

    finalListToSave = [...maintainedProducts, ...newProducts];
  }

  // Salvar nova lista (com entryDate correto)
  await prisma.list.create({
    data: {
      products: finalListToSave,
    },
  });

  return {
    newProducts,
    maintainedProducts,
    removedProducts,
  };
};
