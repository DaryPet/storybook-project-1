import React from "react";

type Character = {
  name: string;
  description: string;
  personality: string;
};

type TableProps = {
  characters: Character[];
};

export const Table: React.FC<TableProps> = ({ characters }) => {
  return (
    <table className="min-w-full bg-white mt-4">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Name</th>
          <th className="py-2 px-4 border-b">Description</th>
          <th className="py-2 px-4 border-b">Personality</th>
        </tr>
      </thead>
      <tbody>
        {characters.map((character, index) => (
          <tr key={index}>
            <td className="py-2 px-4 border-b">{character.name}</td>
            <td className="py-2 px-4 border-b">{character.description}</td>
            <td className="py-2 px-4 border-b">{character.personality}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
