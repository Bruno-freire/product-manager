// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const TMP_DIR = '/tmp'; // diretório temporário disponível no ambiente Node.js (serverless)

const certFileName = 'ca.pem';
const certFilePath = path.join(TMP_DIR, certFileName);

/**
 * Verifica se o arquivo de certificado existe; se não, cria-o a partir da variável de ambiente.
 */
async function ensureCertFile(): Promise<string> {
  try {
    await fs.access(certFilePath);
    // Se conseguir acessar, o arquivo já existe
  } catch (error) {
    // Se não existir, verifica se a variável de ambiente foi definida
    if (!process.env.DATABASE_SSL_CA_CONTENT) {
      throw new Error(
        'Variável de ambiente DATABASE_SSL_CA_CONTENT não definida'
      );
    }
    // Escreve o conteúdo do certificado no arquivo temporário
    await fs.writeFile(certFilePath, process.env.DATABASE_SSL_CA_CONTENT, 'utf8');
  }
  return certFilePath;
}

/**
 * Inicializa o Prisma garantindo que o certificado esteja disponível e monta a string de conexão.
 */
async function initPrisma(): Promise<PrismaClient> {
  // Garante que o certificado esteja disponível no sistema de arquivos
  const caPath = await ensureCertFile();

  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) throw new Error('DATABASE_URL não definida');

  // Se a URL já tiver algum parâmetro, adiciona com '&'; caso contrário, com '?'
  const separator = baseUrl.includes('?') ? '&' : '?';
  // Monta a URL com o parâmetro ssl-ca apontando para o arquivo do certificado
  const urlWithSSL = `${baseUrl}${separator}ssl-ca=${encodeURIComponent(caPath)}`;

  // Cria e retorna a instância do PrismaClient
  return new PrismaClient({
    datasources: {
      db: { url: urlWithSSL },
    },
  });
}

// Inicializa o Prisma uma única vez e exporta a promise
const prismaPromise = initPrisma();

export default prismaPromise;