import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, ...props }) => {
  return (
    <label {...props} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
};

export default Label;
