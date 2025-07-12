"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/utils";

export interface SelectFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      value = "",
      onChange,
      options,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const hasValue = value.length > 0;
    const isActive = isFocused || hasValue;

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    const getBorderColor = () => {
      if (isActive) {
        return "var(--color-primary)";
      }
      if (isHovered) {
        return "#525252";
      }
      return "var(--color-border)";
    };

    const selectStyle: React.CSSProperties = {
      width: "100%",
      height: "55px", // Fixed height matches container
      padding: "0 40px 0 20px", // Extra padding for custom arrow
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      fontFamily: "var(--font-geist-sans)",
      fontSize: "16px",
      color: "var(--text)",
      lineHeight: "1.5",
      boxSizing: "border-box",
      display: "block",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      // Hide default select arrow
      WebkitAppearance: "none",
      MozAppearance: "none",
      appearance: "none",
    };

    const fieldContainerStyle: React.CSSProperties = {
      position: "relative", 
      height: "45px",
      border: `${isActive ? '2px' : '1px'} solid ${getBorderColor()}`,
      borderRadius: "8px",
      transition: `border-color ${isActive ? "180ms" : "70ms"} ease-in-out, border-width 180ms ease-in-out`,
      backgroundColor: "transparent", // match background
      display: "flex",
      alignItems: "center",
    };

    // Custom arrow styles
    const arrowStyle: React.CSSProperties = {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "16px",
      height: "16px",
      pointerEvents: "none",
      color: isFocused ? "var(--color-primary)" : "var(--color-text-secondary)",
      transition: "color 150ms ease-in-out",
      zIndex: 10,
    };

    const optionStyle: React.CSSProperties = {
      backgroundColor: 'var(--surface)',
      color: 'var(--text)',
    };

    return (
      <div
        className={cn("relative w-full min-w-[240px] max-w-[400px]", className)}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <fieldset
          className="relative h-[55px] rounded-lg border-2"
          style={fieldContainerStyle}
        >
          {/* Floating label for both states */}
          <label
            className={cn(
              "absolute pointer-events-none",
              isActive
                ? "left-4 -top-2 text-xs px-2 h-5 flex items-center font-bold"
                : "left-5 top-1/2 -translate-y-1/2 text-base h-[22px] flex items-center font-normal"
            )}
            style={{
              color: isActive ? "var(--color-primary)" : isHovered ? "var(--text)" : "var(--color-text-secondary)", 
              fontFamily: "var(--font-sans)",
              background: isActive ? "var(--surface)" : "transparent",
              padding: isActive ? "0 8px" : "0 8px 0 8px",
              height: isActive ? "14px" : "22px",
              display: "flex",
              alignItems: "center",
              transition: "all 180ms cubic-bezier(0.4,0,0.2,1)",
            }}
            htmlFor={label}
          >
            {label}
          </label>

          {/* Select field */}
          <select
            ref={ref}
            value={value}
            onChange={handleSelectChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            style={selectStyle}
            className="selectfield-input"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} style={optionStyle}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <svg
            style={arrowStyle}
            width="16"
            height="16"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path d="M2 4L6 8L10 4L9.3 3.3L6 6.6L2.7 3.3L2 4Z" />
          </svg>
        </fieldset>
      </div>
    );
  },
);

SelectField.displayName = "SelectField"; 