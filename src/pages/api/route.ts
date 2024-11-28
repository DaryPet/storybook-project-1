import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Проверяем, что запрос является POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Получаем текст из тела запроса
  const { fileContent } = req.body;

  if (!fileContent) {
    return res.status(400).json({ error: "File content is required" });
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    return res.status(500).json({ error: "OpenAI API key is missing" });
  }

  try {
    // 3. Создаём запрос к OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Или "gpt-4", если доступно
        messages: [
          {
            role: "user",
            content: `Extract characters from this text in JSON format:
            [
              { "name": "Character Name", "description": "Description", "personality": "Traits" }
            ]
            Text: ${fileContent}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.5,
      }),
    });

    // 4. Проверяем, успешно ли завершился запрос
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorDetails}`);
    }

    // 5. Извлекаем данные и отправляем их обратно клиенту
    const data = await response.json();
    const characters = data.choices[0].message.content; // Ответ в виде JSON строки

    res.status(200).json({ characters });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error });
  }
}
