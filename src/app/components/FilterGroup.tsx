"use client";

import { useState } from "react";

interface FilterGroupProps {
  label: string;
  options: string[];
  activeValues: string[];
  onToggle: (value: string) => void;
}

export function FilterGroup({
  label,
  options,
  activeValues,
  onToggle,
}: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 hover:text-white transition-colors"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = activeValues.includes(option);
            return (
              <button
                key={option}
                onClick={() => onToggle(option)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-white text-gray-900"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
