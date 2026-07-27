"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * A highly customizable native <select> replacement using framer-motion.
 * Supports padding, border radius, colored options, and hover states.
 */
export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  dropdownClassName,
  optionClassName,
  disabled,
  searchable = false,
  maxVisible = 0
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedOption = options.find((o) => o.value === value);

  let displayOptions = options;
  if (searchable && searchQuery) {
    displayOptions = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if (maxVisible > 0) {
    displayOptions = displayOptions.slice(0, maxVisible);
  }

  return (
    <div
      className={`relative w-fit ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onBlur={(e) => {
        // Close dropdown if focus moves outside of it
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
      tabIndex={-1}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (isOpen) setSearchQuery(""); // Reset search when closing
        }}
        className={`${className} flex items-center justify-between gap-4`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-full min-w-[200px] bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden py-2 ${dropdownClassName || ""}`}
          >
            {searchable && (
              <div className="px-3 pb-2 pt-1">
                <input
                  type="text"
                  placeholder="ابحث هنا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-teal-500"
                  autoFocus
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-[250px]">
              {displayOptions.length > 0 ? (
                displayOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`px-4 py-3 mx-2 my-1 cursor-pointer text-sm font-bold text-center transition-colors rounded-xl ${
                      value === opt.value
                        ? opt.activeClassName || "bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400"
                        : opt.className || optionClassName || "hover:bg-teal-50 dark:hover:bg-teal-900/30 text-gray-900 dark:text-white"
                    }`}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-xs text-gray-500">لا توجد نتائج</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
