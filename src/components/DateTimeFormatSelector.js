"use client";

import { useMemo } from "react";
import { getDateTimeFormatOptions } from "@/lib/dateTime";

function getInputElement(input, inputRef) {
  if (input?.current) return input.current;
  if (input?.nodeType === 1) return input;
  if (inputRef?.current) return inputRef.current;
  return null;
}

function setNativeInputValue(input, value) {
  if (!input) return;

  const prototype = Object.getPrototypeOf(input);
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  valueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function DateTimeFormatSelector({
  input,
  inputRef,
  value,
  onChange,
  name = "date-time-format",
  label = "日期时间格式",
  date = new Date(),
  showExample = true,
  className = "",
}) {
  const options = useMemo(() => getDateTimeFormatOptions(date), [date]);
  const inputElement = getInputElement(input, inputRef);
  const selectedValue = value ?? inputElement?.value ?? "";

  const selectFormat = (option) => {
    setNativeInputValue(inputElement, option.token);
    onChange?.(option.token, option);
  };

  return (
    <fieldset className={`date-time-format-selector ${className}`.trim()}>
      {label ? <legend className="text-sm font-medium">{label}</legend> : null}
      <div className="date-time-format-options">
        {options.map((option) => (
          <label key={option.token} className="date-time-format-option">
            <input
              className="radio radio-primary radio-sm"
              type="radio"
              name={name}
              value={option.token}
              checked={selectedValue === option.token}
              onChange={() => selectFormat(option)}
            />
            <span className="date-time-format-token">{option.token}</span>
            <span className="date-time-format-label">{option.label}</span>
            {showExample ? <span className="date-time-format-example">{option.example}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
