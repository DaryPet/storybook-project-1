import {
  Document,
  SentenceSplitter,
  VectorStoreIndex,
  MetadataMode,
} from "llamaindex";
import type { NextApiRequest, NextApiResponse } from "next";

type Input = {
  document: string; // Входной текст
  chunkSize?: number; // Размер блока
  chunkOverlap?: number; // Перекрытие блоков
};

type Output = {
  error?: string;
  payload?: {
    nodesWithEmbedding: {
      text: string;
      embedding: number[];
    }[];
  };
};

export const runtime = "nodejs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    document: text,
    chunkSize = 512,
    chunkOverlap = 50,
  }: Input = req.body;

  try {
    // 1. Разделение текста на части
    const splitter = new SentenceSplitter({ chunkSize, chunkOverlap });
    const sentences = splitter.splitText(text);

    // 2. Преобразуем строки в массив документов
    const documents = sentences.map(
      (sentence) => new Document({ text: sentence })
    );

    // 3. Создаём векторный индекс
    const index = await VectorStoreIndex.fromDocuments(documents, {});

    // 4. Извлекаем узлы с эмбеддингами
    const nodesWithEmbeddings = await index.getNodeEmbeddingResults(documents);

    // 5. Формируем результат
    const result = nodesWithEmbeddings.map((node) => ({
      text: node.getContent(MetadataMode.NONE), // Указываем MetadataMode
      embedding: node.embedding ?? [], // Убедитесь, что embedding всегда массив
    }));

    // 6. Отправляем результат
    res.status(200).json({ payload: { nodesWithEmbedding: result } });
  } catch (error: unknown) {
    const errorMessage =
      typeof error === "string"
        ? error
        : error instanceof Error
        ? error.message
        : "Unknown error";
    console.error("Error processing request:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
