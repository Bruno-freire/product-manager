import { prisma } from "@/lib/backend/prisma";

async function deleteLastThreeLists(store: string) {
  if (!store) {
    throw new Error("Store é obrigatória.");
  }

  // Buscar as 3 últimas listas
  const lastThree = await prisma.list.findMany({
    where: { store },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, createdAt: true },
  });

  if (lastThree.length === 0) {
    console.log("Nenhuma lista encontrada.");
    return;
  }

  console.log("Listas que serão excluídas:");
  console.log(lastThree);

  // Excluir
  await prisma.list.deleteMany({
    where: {
      id: {
        in: lastThree.map((l) => l.id),
      },
    },
  });

  console.log("Exclusão concluída.");
}

deleteLastThreeLists("13-ARAMIX")
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
