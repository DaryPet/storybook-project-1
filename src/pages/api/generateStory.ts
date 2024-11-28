// import type { NextApiRequest, NextApiResponse } from "next";

// type Character = {
//   name: string;
//   description: string;
//   personality: string;
// };

// type Input = {
//   characters: Character[]; // Извлеченные персонажи
//   storySubject: string; // Тема для истории
//   temperature: number; // Параметры генерации
//   topP: number;
// };

// type Output = {
//   error?: string;
//   payload?: {
//     response: string; // Сгенерированная история
//   };
// };

// export const runtime = "nodejs";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Output>
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   const { characters, storySubject, temperature, topP }: Input = req.body;

//   try {
//     // Формируем описание персонажей
//     const characterDescriptions = characters
//       .map(
//         (character) =>
//           `Name: ${character.name}, Description: ${character.description}, Personality: ${character.personality}`
//       )
//       .join("\n");

//     // Формируем запрос для OpenAI
//     const prompt = `
//       You are a storyteller. Given the following characters:
//       ${characterDescriptions}

//       Now, create a short story (maximum of 10 sentences) based on the subject: "${storySubject}".
//       Include these characters and their personalities in the story.
//     `;

//     // Запрос в OpenAI для создания истории
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Убедитесь, что API ключ доступен
//       },
//       body: JSON.stringify({
//         model: "gpt-4", // Вы можете заменить на другой, например, gpt-3.5-turbo
//         messages: [{ role: "user", content: prompt }],
//         temperature: temperature,
//         topP: topP,
//         max_tokens: 1000, // Ограничим токены, чтобы не превысить 10 предложений
//       }),
//     });

//     // Проверка на ошибки
//     if (!response.ok) {
//       const errorDetails = await response.text();
//       throw new Error(`OpenAI API Error: ${response.status} - ${errorDetails}`);
//     }

//     const data = await response.json();

//     // Возвращаем сгенерированную историю
//     res
//       .status(200)
//       .json({ payload: { response: data.choices[0].message.content.trim() } });
//   } catch (error: unknown) {
//     const errorMessage =
//       typeof error === "string"
//         ? error
//         : error instanceof Error
//         ? error.message
//         : "Unknown error";
//     console.error("Error processing request:", errorMessage);
//     res.status(500).json({ error: errorMessage });
//   }
// }

import type { NextApiRequest, NextApiResponse } from "next";

type Character = {
  name: string;
  description: string;
};

type Input = {
  characters: Character[];
  storySubject: string;
  genre: string;
  temperature: number;
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { characters, storySubject, genre, temperature }: Input = req.body;

  try {
    // Формируем описание персонажей
    const characterDescriptions = characters
      .map(
        (character) =>
          `Name: ${character.name}, Description: ${character.description}`
      )
      .join("\n");

    // Формируем запрос для OpenAI
    const prompt = `
      You are a storyteller. Given the following characters:
      ${characterDescriptions}
      
      Create a ${genre.toLowerCase()} story based on the subject: "${storySubject}".
      Include these characters and their personalities in the story.
    `;

    // Запрос к OpenAI для генерации истории
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    // Проверка на ошибки
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();

    // Возвращаем сгенерированную историю
    res
      .status(200)
      .json({ payload: { response: data.choices[0].message.content.trim() } });
  } catch (error) {
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