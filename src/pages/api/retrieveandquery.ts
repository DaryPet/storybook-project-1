import type { NextApiRequest, NextApiResponse } from "next";
import {
  IndexDict,
  OpenAI,
  RetrieverQueryEngine,
  TextNode,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
type Input = {
  topK?: number;
  nodesWithEmbedding: {
    text: string;
    embedding: number[];
  }[];
  temperature: number;
  topP: number;
};

type Output = {
  error?: string;
  payload?: {
    response: string;
  };
};

export const runtime = "nodejs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { topK, nodesWithEmbedding, temperature, topP }: Input = req.body;

  try {
    const embeddingResults = nodesWithEmbedding.map((config) => {
      return new TextNode({ text: config.text, embedding: config.embedding });
    });

    const indexDict = new IndexDict();
    for (const node of embeddingResults) {
      indexDict.addNode(node);
    }

    const index = await VectorStoreIndex.init({
      indexStruct: indexDict,
      serviceContext: serviceContextFromDefaults({
        llm: new OpenAI({
          model: "gpt-4-1106-preview",
          temperature: temperature,
          topP: topP,
        }),
      }),
    });

    const vectorStoreKey = Object.keys(
      index.vectorStores
    )[0] as keyof typeof index.vectorStores;
    const vectorStore = index.vectorStores[vectorStoreKey];

    if (vectorStore) {
      if (typeof vectorStore.add === "function") {
        await vectorStore.add(embeddingResults);
      }
      if ("storesText" in vectorStore && !vectorStore.storesText) {
        await index.docStore.addDocuments(embeddingResults, true);
      }
    }

    const retriever = index.asRetriever();
    retriever.similarityTopK = topK ?? 2;

    const queryEngine = new RetrieverQueryEngine(retriever);

    const result = await queryEngine.query({
      query: `Extract characters from the text and return as JSON.`,
    });

    res.status(200).json({ payload: { response: result.response } });
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
