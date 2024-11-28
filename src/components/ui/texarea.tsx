import React from "react";

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  ...props
}) => {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
    />
  );
};

export default Textarea;
