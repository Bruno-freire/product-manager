import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateTimeInDays } from '../../../lib/utils';

const prisma = new PrismaClient();

type ProdutoComparado = {
  id: number;
  codigo: string;
  nomeProduto: string;
  tempoDePermanencia: number;
};

export async function POST(request: Request) {
  try {
    const { listaProdutos } = await request.json();
    console.log(listaProdutos)
    if (!listaProdutos) {
      return NextResponse.json(
        { success: false, error: 'Lista de produtos vazia' },
        { status: 400 }
      );
    }
    
    const regex = /^\d+\.\s+(\d+)\s+([A-Za-zÀ-ÿ0-9\/&.,()°+-]+?)-/gm;
    const resultados = [...listaProdutos.matchAll(regex)];
    
    const produtosNovaList = resultados.map(result => ({
      codigo: result[1],
      nomeProduto: result[2]
    }));
    
    const produtosAtivos = await prisma.produto.findMany({
      where: { ativo: true }
    });
    
    const activeCodes = produtosAtivos.map(p => p.codigo);
    const novaCodes = produtosNovaList.map(p => p.codigo);
    
    const novos = produtosNovaList.filter(p => !activeCodes.includes(p.codigo));
    const removidos = produtosAtivos.filter(p => !novaCodes.includes(p.codigo));
    const existentes = produtosAtivos.filter(p => novaCodes.includes(p.codigo));
    
    const createdProdutos = [];
    for (const prod of novos) {
      const produtoExistente = await prisma.produto.findFirst({
        where: { codigo: prod.codigo, ativo: false }
      });

      let created;
      if (produtoExistente) {
        created = await prisma.produto.update({
          where: { id: produtoExistente.id },
          data: {
            ativo: true
          }
        });
      } else {
        created = await prisma.produto.create({
          data: {
            codigo: prod.codigo,
            nomeProduto: prod.nomeProduto,
            dataEntrada: new Date(),
            ativo: true
          }
        });
      }
      createdProdutos.push(created);
    }
    
    for (const prod of removidos) {
      await prisma.produto.update({
        where: { id: prod.id },
        data: { ativo: false }
      });
    }
    
    const responseNovos: ProdutoComparado[] = createdProdutos.map(prod => ({
      id: prod.id,
      codigo: prod.codigo,
      nomeProduto: prod.nomeProduto,
      tempoDePermanencia: calculateTimeInDays(prod.dataEntrada, prod.ativo)
    }));
    
    const responseExistentes: ProdutoComparado[] = existentes.map(prod => ({
      id: prod.id,
      codigo: prod.codigo,
      nomeProduto: prod.nomeProduto,
      tempoDePermanencia: calculateTimeInDays(prod.dataEntrada, prod.ativo)
    }));
    
    const responseRemovidos: ProdutoComparado[] = removidos.map(prod => ({
      id: prod.id,
      codigo: prod.codigo,
      nomeProduto: prod.nomeProduto,
      tempoDePermanencia: 0
    }));
    
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
