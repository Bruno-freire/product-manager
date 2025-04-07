import { prisma } from "./prisma";
import { ProductItem } from "@/app/types/ProductType";
import { compareListsOfProducts } from "./comparedLists";
import { aggregateDailyProducts } from "./aggregateDailyProducts";

interface TypedList {
  id: number;
  createdAt: Date;
  products: ProductItem[];
}

export const compareDailyProductLists = async (day1: string, day2: string) => {
  try {
    // Cria os limites de data para cada dia
    const startDay1 = new Date(`${day1}T00:00:00.000Z`);
    const endDay1 = new Date(`${day1}T23:59:59.999Z`);
    endDay1.setHours(23, 59, 59, 999);

    const startDay2 = new Date(`${day2}T00:00:00.000Z`);
    const endDay2 = new Date(`${day2}T23:59:59.999Z`);
    endDay2.setHours(23, 59, 59, 999);

    // Consulta todas as listas registradas em cada dia
    const listsDay1 = await prisma.list.findMany({
      where: {
        createdAt: {
          gte: startDay1,
          lte: endDay1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const listsDay2 = await prisma.list.findMany({
      where: {
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

    // Agrega as listas de cada dia em uma única lista de produtos
    const aggregatedDay1 = aggregateDailyProducts(listsDay1Typed);
    const aggregatedDay2 = aggregateDailyProducts(listsDay2Typed);

    const { newProducts, maintainedProducts, removedProducts } =
      compareListsOfProducts(
        aggregatedDay1,
        aggregatedDay2,
        true // atualiza o entryDate apenas para novos produtos (mantém o de mantidos)
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
