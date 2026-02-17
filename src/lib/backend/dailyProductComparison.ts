import { prisma } from "./prisma";
import { ProductItem } from "@/app/types/ProductType";
import { compareListsOfProducts } from "./comparedLists";
import { aggregateDailyProducts } from "./aggregateDailyProducts";

interface TypedList {
  id: number;
  createdAt: Date;
  products: ProductItem[];
}

export const compareDailyProductLists = async (
  store: string,
  day1: string,
  day2: string
) => {
  if (!store) {
    throw new Error("Store obrigatória.");
  }

  try {
    // 🔎 Intervalos de datas
    const startDay1 = new Date(`${day1}T00:00:00.000Z`);
    const endDay1 = new Date(`${day1}T23:59:59.999Z`);

    const startDay2 = new Date(`${day2}T00:00:00.000Z`);
    const endDay2 = new Date(`${day2}T23:59:59.999Z`);

    // 🔒 Buscar listas APENAS da store correta
    const listsDay1 = await prisma.list.findMany({
      where: {
        store,
        createdAt: {
          gte: startDay1,
          lte: endDay1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const listsDay2 = await prisma.list.findMany({
      where: {
        store,
        createdAt: {
          gte: startDay2,
          lte: endDay2,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const listsDay1Typed: TypedList[] = listsDay1.map((list) => ({
      ...list,
      products: list.products as ProductItem[],
    }));

    const listsDay2Typed: TypedList[] = listsDay2.map((list) => ({
      ...list,
      products: list.products as ProductItem[],
    }));

    const aggregatedDay1 = aggregateDailyProducts(listsDay1Typed);
    const aggregatedDay2 = aggregateDailyProducts(listsDay2Typed);

    const { newProducts, maintainedProducts, removedProducts } =
      compareListsOfProducts(
        aggregatedDay1,
        aggregatedDay2,
        true
      );

    return {
      newProducts,
      maintainedProducts,
      removedProducts,
    };
  } catch (error: any) {
    console.error("Erro ao comparar listas diárias:", error);
    throw new Error("Erro ao comparar listas de produtos por dia.");
  }
};
