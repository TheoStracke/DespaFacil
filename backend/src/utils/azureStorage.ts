/**
 * Azure Blob Storage utility
 *
 * Variáveis de ambiente necessárias (quando STORAGE_PROVIDER=azure):
 *   AZURE_STORAGE_CONNECTION_STRING  — connection string completa  OU
 *   AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY
 *   AZURE_STORAGE_CONTAINER_NAME     — nome do container (ex: "despafacil-uploads")
 */

import { Readable } from 'stream';

// Carregamento lazy para não quebrar builds sem o pacote instalado
let BlobServiceClient: any = null;
let StorageSharedKeyCredential: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sdk = require('@azure/storage-blob');
  BlobServiceClient = sdk.BlobServiceClient;
  StorageSharedKeyCredential = sdk.StorageSharedKeyCredential;
} catch (_) {
  // keep null — erro será lançado em runtime se STORAGE_PROVIDER=azure
}

function getContainerClient() {
  if (!BlobServiceClient) {
    throw new Error(
      'STORAGE_PROVIDER=azure, mas @azure/storage-blob não está instalado. ' +
        'Execute: npm install @azure/storage-blob'
    );
  }

  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  if (!containerName) {
    throw new Error('AZURE_STORAGE_CONTAINER_NAME não definida.');
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (connectionString) {
    const client = BlobServiceClient.fromConnectionString(connectionString);
    return client.getContainerClient(containerName);
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  if (!accountName || !accountKey) {
    throw new Error(
      'Configure AZURE_STORAGE_CONNECTION_STRING ou ' +
        'AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY.'
    );
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const serviceUrl = `https://${accountName}.blob.core.windows.net`;
  const client = new BlobServiceClient(serviceUrl, credential);
  return client.getContainerClient(containerName);
}

/**
 * Faz upload de um Buffer para o Azure Blob Storage.
 * Retorna o nome do blob (usado como "path" no banco de dados).
 */
export async function uploadToAzure(
  buffer: Buffer,
  blobName: string,
  contentType: string
): Promise<string> {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  console.log(`☁️  Azure upload concluído: ${blobName}`);
  return blobName;
}

/**
 * Retorna um Readable stream para o blob especificado.
 * Compatível com pipe() para res.pipe().
 */
export async function getAzureReadStream(blobName: string): Promise<Readable> {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download(0);

  if (!downloadResponse.readableStreamBody) {
    throw new Error(`Blob não encontrado ou vazio: ${blobName}`);
  }

  // O SDK retorna um NodeJS.ReadableStream — precisamos de um stream.Readable
  return downloadResponse.readableStreamBody as Readable;
}

/**
 * Retorna o tamanho em bytes do blob, ou null se não encontrado.
 */
export async function getAzureBlobSize(blobName: string): Promise<number | null> {
  try {
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const props = await blockBlobClient.getProperties();
    return props.contentLength ?? null;
  } catch {
    return null;
  }
}

/**
 * Deleta um blob. Ignora silenciosamente se não encontrado.
 */
export async function deleteFromAzure(blobName: string): Promise<void> {
  try {
    const containerClient = getContainerClient();
    await containerClient.deleteBlob(blobName, { deleteSnapshots: 'include' });
    console.log(`🗑️  Azure blob deletado: ${blobName}`);
  } catch (err: any) {
    // BlobNotFound — sem problema
    if (err?.statusCode !== 404) {
      console.error(`Erro ao deletar blob ${blobName}:`, err?.message);
    }
  }
}

/** Retorna true quando o storage provider ativo é Azure */
export function isAzureProvider(): boolean {
  return (process.env.STORAGE_PROVIDER || 'local').toLowerCase() === 'azure';
}
