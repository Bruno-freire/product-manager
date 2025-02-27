'use client';

import { useState, useEffect } from 'react';

type ProdutoComparado = {
  id: number;
  codigo: string;
  nomeProduto: string;
  tempoDePermanencia: number;
};

function calcularTempoPermanencia(dataEntrada: string): string {
  const entrada = new Date(dataEntrada);
  const agora = new Date();
  const diffMs = agora.getTime() - entrada.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);
  const diffSemanas = Math.floor(diffDias / 7);

  if (diffMin < 60) return `${diffMin} minutos`;
  if (diffHoras < 24) return `${diffHoras} horas`;
  if (diffDias < 7) return `${diffDias} dias`;
  return `${diffSemanas} semanas`;
}

export default function Home() {
  const [listaProdutos, setListaProdutos] = useState('');
  const [produtosNovos, setProdutosNovos] = useState<ProdutoComparado[]>([]);
  const [produtosExistentes, setProdutosExistentes] = useState<ProdutoComparado[]>([]);
  const [produtosRemovidos, setProdutosRemovidos] = useState<ProdutoComparado[]>([]);
  const [error, setError] = useState('');
  const [snapshotId, setSnapshotId] = useState<number | null>(null);

  // Função para buscar produtos existentes
  const buscarProdutosExistentes = async () => {
    try {
      const response = await fetch('/api/products/existing', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setProdutosExistentes(data.produtosExistentes || []);
      } else {
        setError(data.error || 'Erro ao carregar produtos existentes');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Usar useEffect para carregar produtos existentes ao montar o componente
  useEffect(() => {
    buscarProdutosExistentes();
  }, []);

  const atualizarLista = async () => {
    setError('');
    try {
      const response = await fetch('/api/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listaProdutos }),
      });
      const data = await response.json();
      if (data.success) {
        setProdutosNovos(data.produtosNovos || []);
        setProdutosExistentes(data.produtosExistentes || []);
        setProdutosRemovidos(data.produtosRemovidos || []);
        setSnapshotId(data.snapshotId);
      } else {
        setError(data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Gerenciador de Produtos</h1>
        
        <textarea
          className="w-full h-40 p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Cole a lista de produtos atualizada..."
          value={listaProdutos}
          onChange={(e) => setListaProdutos(e.target.value)}
        />
        
        <button
          onClick={atualizarLista}
          className="w-full cursor-pointer py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
        >
          Atualizar Lista
        </button>
        
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>

      <section className="mt-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Comparação de Produtos</h2>
        <div className="flex space-x-6">
          <div className="bg-gray-100 p-4 rounded-lg w-1/3">
            <h3 className="font-bold text-gray-700">Novos</h3>
            {produtosNovos.length > 0 ? (
              <ul className="space-y-2">
                {produtosNovos.map(prod => (
                  <li key={prod.id} className="text-gray-600">
                    {prod.nomeProduto} (Código: {prod.codigo}) – {prod.tempoDePermanencia} dias
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum novo</p>
            )}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg w-1/3">
            <h3 className="font-bold text-gray-700">Existentes</h3>
            {produtosExistentes.length > 0 ? (
              <ul className="space-y-2">
                {produtosExistentes.map(prod => (
                  <li key={prod.id} className="text-gray-600">
                    {prod.nomeProduto} (Código: {prod.codigo}) – {prod.tempoDePermanencia} dias
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum existente</p>
            )}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg w-1/3">
            <h3 className="font-bold text-gray-700">Removidos</h3>
            {produtosRemovidos.length > 0 ? (
              <ul className="space-y-2">
                {produtosRemovidos.map(prod => (
                  <li key={prod.id} className="text-gray-600">
                    {prod.nomeProduto} (Código: {prod.codigo}) – {prod.tempoDePermanencia} dias
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum removido</p>
            )}
          </div>
        </div>
      </section>

      {snapshotId && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Snapshot ID: {snapshotId}
        </p>
      )}
    </main>
  );
}