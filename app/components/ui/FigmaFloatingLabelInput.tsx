"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/utils";

export interface FormFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      value = "",
      onChange,
      placeholder,
      type = "text",
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const hasValue = value.length > 0;
    const isActive = isFocused || hasValue;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const inputStyle: React.CSSProperties = {
      width: "100%",
      height: "55px", // Fixed height matches container
      padding: "0 20px",
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      fontFamily: "var(--font-sans)",
      fontWeight: "bold",
      fontSize: "16px",
      color: "var(--text)",
      lineHeight: "1.5",
      boxSizing: "border-box",
      display: "block",
      cursor: disabled ? "not-allowed" : "text",
      opacity: disabled ? 0.5 : 1,
    };

    const fieldContainerStyle: React.CSSProperties = {
      position: "relative",
      height: "55px",
      border: `2px solid ${getBorderColor()}`,
      borderRadius: "8px",
      transition: `border-color ${isActive ? "240ms" : "70ms"} ease-in-out`,
      backgroundColor: "transparent", // match background
      display: "flex",
      alignItems: "center",
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
              "absolute font-bold pointer-events-none",
              isActive
                ? "left-4 -top-3 text-xs px-2 h-5 flex items-center"
                : "left-5 top-1/2 -translate-y-1/2 text-base h-[22px] flex items-center"
            )}
            style={{
              color: isActive ? "var(--color-primary)" : isHovered ? "var(--text)" : "var(--text)",
              fontFamily: "var(--font-sans)",
              background: isActive ? "var(--surface-light)" : "transparent",
              padding: isActive ? "0 8px" : "0 8px 0 8px",
              height: isActive ? "20px" : "22px",
              display: "flex",
              alignItems: "center",
              transition: "all 240ms cubic-bezier(0.4,0,0.2,1)",
            }}
            htmlFor={label}
          >
            {label}
          </label>

          {/* Input field */}
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={isActive ? placeholder : ""}
            style={inputStyle}
            className="formfield-input"
          />
        </fieldset>
      </div>
    );
  },
);

FormField.displayName = "FormField";
