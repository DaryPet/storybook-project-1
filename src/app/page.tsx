// "use client";

// import React, { useState, ChangeEvent } from "react";
// import Button from "@/components/ui/button";
// import Input from "@/components/ui/input";
// import Textarea from "@/components/ui/texarea";
// import Label from "@/components/ui/label";

// // Определяем тип персонажа
// type Character = {
//   name: string;
//   description: string;
// };

// export default function Home() {
//   const [text, setText] = useState<string>(""); // Загруженный текст
//   const [characters, setCharacters] = useState<Character[]>([]); // Персонажи
//   const [answer, setAnswer] = useState<string>(""); // Статус выполнения
//   const [loadingIndex, setLoadingIndex] = useState<boolean>(false); // Флаг построения индекса
//   const [loadingCharacters, setLoadingCharacters] = useState<boolean>(false); // Флаг извлечения персонажей

//   const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const content = event.target?.result as string;
//         setText(content);
//       };
//       reader.readAsText(file);
//     }
//   };

//   const buildIndexAndExtractCharacters = async () => {
//     if (!text) {
//       alert("Please upload a text file first.");
//       return;
//     }

//     setLoadingIndex(true);
//     setAnswer("Building vector index...");

//     try {
//       // Шаг 1: Создание векторного индекса
//       const indexResponse = await fetch("/api/splitandembed", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           document: text,
//           chunkSize: 512,
//           chunkOverlap: 50,
//         }),
//       });

//       const { error: indexError, payload: indexPayload } =
//         await indexResponse.json();

//       if (indexError) {
//         alert(`Error building index: ${indexError}`);
//         setAnswer("Failed to build index.");
//         return;
//       }

//       setAnswer("Vector index successfully built!");

//       // Шаг 2: Извлечение персонажей
//       setLoadingCharacters(true);
//       const characterResponse = await fetch("/api/retrieveandquery", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nodesWithEmbedding: indexPayload.nodesWithEmbedding,
//           topK: 5, // Анализируем 5 ближайших фрагментов
//           temperature: 0.7,
//           topP: 1.0,
//         }),
//       });

//       const { error: characterError, payload: characterPayload } =
//         await characterResponse.json();

//       if (characterError) {
//         alert(`Error extracting characters: ${characterError}`);
//         setAnswer("Failed to extract characters.");
//         return;
//       }

//       // Парсим результат в массив объектов
//       const extractedCharacters: Character[] = JSON.parse(
//         characterPayload.response.replace(/```json|```/g, "").trim()
//       );

//       setCharacters(extractedCharacters); // Сохраняем персонажей
//       setAnswer("Characters successfully extracted!");
//     } catch (error) {
//       console.error("Error during processing:", error);
//       setAnswer("An error occurred during processing.");
//     } finally {
//       setLoadingIndex(false);
//       setLoadingCharacters(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Character Extraction Tool</h1>

//       {/* Upload Text File */}
//       <div className="mb-4">
//         <Label>Upload Your Text File (.txt):</Label>
//         <Input type="file" accept=".txt" onChange={handleFileUpload} />
//       </div>

//       {/* Display Uploaded Text */}
//       {text && (
//         <div className="mb-4">
//           <Label>Uploaded Text:</Label>
//           <Textarea value={text} readOnly className="mt-2" />
//         </div>
//       )}

//       {/* Build Vector Index and Extract Characters */}
//       <Button
//         onClick={buildIndexAndExtractCharacters}
//         disabled={loadingIndex || !text}
//       >
//         {loadingIndex || loadingCharacters
//           ? "Processing..."
//           : "Build Index and Extract Characters"}
//       </Button>

//       {/* Display Extracted Characters */}
//       {characters.length > 0 && (
//         <div className="mt-6">
//           <Label>Extracted Characters:</Label>
//           <ul className="mt-2">
//             {characters.map((character, index) => (
//               <li key={index} className="mb-4">
//                 <strong>Name:</strong> {character.name}
//                 <br />
//                 <strong>Description:</strong> {character.description}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Display Status */}
//       {answer && (
//         <div className="mt-6">
//           <Label>Status:</Label>
//           <Textarea value={answer} readOnly className="mt-2" />
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, ChangeEvent } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/texarea";
import Label from "@/components/ui/label";

// Определяем тип персонажа
type Character = {
  name: string;
  description: string;
};

export default function Home() {
  const [text, setText] = useState<string>(""); // Загруженный текст
  const [characters, setCharacters] = useState<Character[]>([]); // Персонажи
  const [answer, setAnswer] = useState<string>(""); // Статус выполнения
  const [loadingIndex, setLoadingIndex] = useState<boolean>(false); // Флаг построения индекса
  const [loadingCharacters, setLoadingCharacters] = useState<boolean>(false); // Флаг извлечения персонажей

  // Новые состояния для генерации истории
  const [story, setStory] = useState<string>(""); // Сгенерированная история
  const [loadingStory, setLoadingStory] = useState<boolean>(false); // Флаг генерации истории
  const [storySubject, setStorySubject] = useState<string>(""); // Тема истории
  const [genre, setGenre] = useState<string>("Adventure"); // Жанр истории

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const buildIndexAndExtractCharacters = async () => {
    if (!text) {
      alert("Please upload a text file first.");
      return;
    }

    setLoadingIndex(true);
    setAnswer("Building vector index...");

    try {
      // Шаг 1: Создание векторного индекса
      const indexResponse = await fetch("/api/splitandembed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: text,
          chunkSize: 512,
          chunkOverlap: 50,
        }),
      });

      const { error: indexError, payload: indexPayload } =
        await indexResponse.json();

      if (indexError) {
        alert(`Error building index: ${indexError}`);
        setAnswer("Failed to build index.");
        return;
      }

      setAnswer("Vector index successfully built!");

      // Шаг 2: Извлечение персонажей
      setLoadingCharacters(true);
      const characterResponse = await fetch("/api/retrieveandquery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodesWithEmbedding: indexPayload.nodesWithEmbedding,
          topK: 5, // Анализируем 5 ближайших фрагментов
          temperature: 0.7,
          topP: 1.0,
        }),
      });

      const { error: characterError, payload: characterPayload } =
        await characterResponse.json();

      if (characterError) {
        alert(`Error extracting characters: ${characterError}`);
        setAnswer("Failed to extract characters.");
        return;
      }

      // Парсим результат в массив объектов
      const extractedCharacters: Character[] = JSON.parse(
        characterPayload.response.replace(/```json|```/g, "").trim()
      );

      setCharacters(extractedCharacters); // Сохраняем персонажей
      setAnswer("Characters successfully extracted!");
    } catch (error) {
      console.error("Error during processing:", error);
      setAnswer("An error occurred during processing.");
    } finally {
      setLoadingIndex(false);
      setLoadingCharacters(false);
    }
  };

  const generateStory = async () => {
    if (characters.length === 0) {
      alert("No characters available. Please extract characters first.");
      return;
    }

    if (!storySubject) {
      alert("Please enter a subject for the story.");
      return;
    }

    setLoadingStory(true);
    setStory("Generating story...");

    try {
      const response = await fetch("/api/generateStory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characters,
          storySubject,
          genre,
          temperature: 0.7,
          topP: 1.0,
        }),
      });

      const { error, payload } = await response.json();

      if (error) {
        alert(`Error generating story: ${error}`);
        setStory("Failed to generate story.");
        return;
      }

      setStory(payload.response); // Сохраняем историю
    } catch (error) {
      console.error("Error generating story:", error);
      setStory("An error occurred while generating the story.");
    } finally {
      setLoadingStory(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Character Extraction Tool</h1>

      {/* Upload Text File */}
      <div className="mb-4">
        <Label>Upload Your Text File (.txt):</Label>
        <Input type="file" accept=".txt" onChange={handleFileUpload} />
      </div>

      {/* Display Uploaded Text */}
      {text && (
        <div className="mb-4">
          <Label>Uploaded Text:</Label>
          <Textarea value={text} readOnly className="mt-2" />
        </div>
      )}

      {/* Build Vector Index and Extract Characters */}
      <Button
        onClick={buildIndexAndExtractCharacters}
        disabled={loadingIndex || !text}
      >
        {loadingIndex || loadingCharacters
          ? "Processing..."
          : "Build Index and Extract Characters"}
      </Button>

      {/* Display Extracted Characters */}
      {characters.length > 0 && (
        <div className="mt-6">
          <Label>Extracted Characters:</Label>
          <ul className="mt-2">
            {characters.map((character, index) => (
              <li key={index} className="mb-4">
                <strong>Name:</strong> {character.name}
                <br />
                <strong>Description:</strong> {character.description}
              </li>
            ))}
          </ul>

          {/* Story Subject */}
          <div className="mt-4">
            <Label>Enter Story Subject:</Label>
            <Input
              type="text"
              value={storySubject}
              onChange={(e) => setStorySubject(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Genre Selection */}
          <div className="mt-4">
            <Label>Select Genre:</Label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="mt-2 p-2 border rounded"
            >
              <option value="Adventure">Adventure</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Mystery">Mystery</option>
              <option value="Comedy">Comedy</option>
            </select>
          </div>

          {/* Generate Story */}
          <Button
            onClick={generateStory}
            disabled={loadingStory}
            className="mt-4"
          >
            {loadingStory ? "Generating Story..." : "Generate Story"}
          </Button>

          {/* Display Story */}
          {story && (
            <div className="mt-6">
              <Label>Generated Story:</Label>
              <Textarea value={story} readOnly className="mt-2" />
            </div>
          )}
        </div>
      )}

      {/* Display Status */}
      {answer && (
        <div className="mt-6">
          <Label>Status:</Label>
          <Textarea value={answer} readOnly className="mt-2" />
        </div>
      )}
    </div>
  );
}
