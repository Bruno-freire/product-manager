import { ProductItem } from "@/app/types/ProductType";
import { compareListsOfProducts } from "./comparedLists";
import { prisma } from "./prisma";

export const processingListProduct = async (
  store: string,
  productList?: string
) => {
  if (!store) {
    throw new Error("Store obrigatória.");
  }

  // ✅ Caso NÃO receba nova lista → compara últimas 2 da loja específica
  if (!productList) {
    const lastTwoLists = await prisma.list.findMany({
      where: { store },
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

    return compareListsOfProducts(
      penultimateList.products as ProductItem[],
      lastList.products as ProductItem[],
      false
    );
  }

  // ✅ Parse da nova lista recebida
  const lines = productList
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const newProductList: Omit<ProductItem, "entryDate">[] = lines
    .map((line) => {
      const columns = line.split("\t").map((col) => col.trim());
      if (columns.length < 8) return null;

      const code = columns[0];
      const name = columns[1];
      const itemStore = columns[2];
      const address = columns[4];
      const amount = columns[5];
      
      if (!code || !name || !address || !amount || !itemStore) return null;

      return {
        code,
        name,
        store: itemStore,
        address,
        amount,
      };
    })
    .filter((item): item is Omit<ProductItem, "entryDate"> => item !== null);

  if (newProductList.length === 0) {
    throw new Error("Lista sem produtos válidos.");
  }

  // ✅ Validar se todos os produtos pertencem à store do usuário
  const stores = new Set(newProductList.map((p) => p.store));

  if (stores.size !== 1 || !stores.has(store)) {
    throw new Error("Lista não pertence à store do usuário.");
  }

  // ✅ Buscar última lista da mesma store
  const lastList = await prisma.list.findFirst({
    where: { store },
    orderBy: { createdAt: "desc" },
  });

  let finalListToSave: ProductItem[] = [];
  let newProducts: ProductItem[] = [];
  let maintainedProducts: ProductItem[] = [];
  let removedProducts: ProductItem[] = [];

  if (!lastList) {
    const entryDate = new Date().toISOString();

    newProducts = newProductList.map((p) => ({
      ...p,
      entryDate,
    }));

    finalListToSave = newProducts;
  } else {
    const comparison = compareListsOfProducts(
      lastList.products as ProductItem[],
      newProductList
    );

    newProducts = comparison.newProducts;
    maintainedProducts = comparison.maintainedProducts;
    removedProducts = comparison.removedProducts;

    finalListToSave = [...maintainedProducts, ...newProducts];
  }

  // ✅ Salvar nova lista vinculada à store correta
  await prisma.list.create({
    data: {
      store,
      products: finalListToSave,
    },
  });

  return {
    newProducts,
    maintainedProducts,
    removedProducts,
  };
};
