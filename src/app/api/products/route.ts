// src/app/api/produtos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ProdutoComparado = {
  id: number;
  codigo: string;
  nomeProduto: string;
  tempoDePermanencia: number;
};

// Função para calcular o tempo de permanência (em dias)
// Se o produto estiver inativo, retorna 0
function calcularTempoEmDias(dataEntrada: Date, ativo: boolean): number {
  if (!ativo) return 0;
  const hoje = new Date();
  const diffMs = hoje.getTime() - new Date(dataEntrada).getTime();
  return Math.floor(diffMs / (1000 * 3600 * 24));
}

export async function POST(request: Request) {
  try {
    const { listaProdutos } = await request.json();
    if (!listaProdutos) {
      return NextResponse.json(
        { success: false, error: 'Lista de produtos vazia' },
        { status: 400 }
      );
    }
    
    // Expressão regular para extrair os produtos
    // Exemplo: "1. 123456 PRODUTO XYZ-Detalhes..."
    const regex = /^\d+\.\s+(\d+)\s+([A-Za-zÀ-ÿ0-9\/ ]+?)-/gm;
    const resultados = [...listaProdutos.matchAll(regex)];
    
    // Extraindo produtos da nova lista (apenas código e nome)
    const produtosNovaList = resultados.map(result => ({
      codigo: result[1],
      nomeProduto: result[2]
    }));
    
    // Buscar produtos ativos no banco
    const produtosAtivos = await prisma.produto.findMany({
      where: { ativo: true }
    });
    
    // Listas de códigos para comparação
    const activeCodes = produtosAtivos.map(p => p.codigo);
    const novaCodes = produtosNovaList.map(p => p.codigo);
    
    // Produtos novos: presentes na nova lista, mas não entre os ativos
    const novos = produtosNovaList.filter(p => !activeCodes.includes(p.codigo));
    
    // Produtos removidos: que estavam ativos mas não aparecem na nova lista
    const removidos = produtosAtivos.filter(p => !novaCodes.includes(p.codigo));
    
    // Produtos existentes: que já estão ativos e continuam na nova lista
    const existentes = produtosAtivos.filter(p => novaCodes.includes(p.codigo));
    
    // Inserir produtos novos na tabela Produto
    const createdProdutos = [];
    for (const prod of novos) {
      const created = await prisma.produto.create({
        data: {
          codigo: prod.codigo,
          nomeProduto: prod.nomeProduto,
          dataEntrada: new Date(),
          ativo: true
        }
      });
      createdProdutos.push(created);
    }
    
    // Marcar como inativos os produtos removidos
    for (const prod of removidos) {
      await prisma.produto.update({
        where: { id: prod.id },
        data: { ativo: false }
      });
    }
    
    // Preparar arrays de resposta (calculando tempo de permanência)
    const responseNovos: ProdutoComparado[] = createdProdutos.map(prod => ({
      id: prod.id,
      codigo: prod.codigo,
      nomeProduto: prod.nomeProduto,
      tempoDePermanencia: calcularTempoEmDias(prod.dataEntrada, prod.ativo)
    }));
    
    const responseExistentes: ProdutoComparado[] = existentes.map(prod => ({
      id: prod.id,
      codigo: prod.codigo,
      nomeProduto: prod.nomeProduto,
      tempoDePermanencia: calcularTempoEmDias(prod.dataEntrada, prod.ativo)
    }));
    
    const responseRemovidos: ProdutoComparado[] = removidos.map(prod => ({
      id: prod.id,
      codigo: prod.codigo,
      nomeProduto: prod.nomeProduto,
      tempoDePermanencia: 0
    }));
    
    // Criar o snapshot (Lista) para o dia, relacionando com os produtos ativos (novos + existentes)
    const snapshot = await prisma.lista.create({
      data: {
        listaProdutos: {
          create: [
            ...createdProdutos.map(prod => ({
              produto: { connect: { id: prod.id } }
            })),
            ...existentes.map(prod => ({
              produto: { connect: { id: prod.id } }
            }))
          ]
        }
      },
      include: { listaProdutos: { include: { produto: true } } }
    });
    
    return NextResponse.json({
      success: true,
      produtosNovos: responseNovos,
      produtosExistentes: responseExistentes,
      produtosRemovidos: responseRemovidos,
      snapshotId: snapshot.id
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar a lista' },
      { status: 500 }
    );
  }
}
