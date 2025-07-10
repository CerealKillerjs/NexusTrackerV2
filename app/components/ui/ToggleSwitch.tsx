import { forwardRef, useState, InputHTMLAttributes } from "react"
import { cn } from "@/app/lib/utils"

/**
 * ToggleSwitchProps interface
 * Extends HTML input attributes and adds optional label and controlled/uncontrolled support
 */
interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean // Controlled checked state
  defaultChecked?: boolean // Uncontrolled initial checked state
}

/**
 * ToggleSwitch Component
 *
 * A pixel-perfect toggle switch matching Figma specs:
 * - 48x24 pill, 18x18 knob, 3px padding
 * - #099FEB (on), #888888 (off), #D9D9D9 (knob)
 * - 300ms ease-out animation
 * - Accessible and supports controlled/uncontrolled usage
 *
 * @param props - ToggleSwitchProps for configuration
 * @param ref - Forwarded ref for DOM access
 */
export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ checked, defaultChecked, onChange, className, disabled, ...props }, ref) => {
    // Internal state for uncontrolled usage
    const [internalChecked, setInternalChecked] = useState(defaultChecked || false)
    const isControlled = checked !== undefined
    const isOn = isControlled ? checked : internalChecked

    // Handle toggle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked)
      onChange?.(e)
    }

    return (
      <label
        className={cn(
          "inline-flex items-center cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {/* Hidden native checkbox for accessibility */}
        <input
          type="checkbox"
          className="sr-only"
          checked={isControlled ? checked : internalChecked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          ref={ref}
          disabled={disabled}
          aria-checked={isOn}
          {...props}
        />
        {/* Pill background */}
        <span
          className={cn(
            "relative w-[48px] h-[24px] flex items-center rounded-full transition-all duration-300 ease-out",
            isOn ? "bg-[#099FEB]" : "bg-[#888888]"
          )}
        >
          {/* Knob */}
          <span
            className={cn(
              "absolute top-[3px] w-[18px] h-[18px] rounded-full bg-[#D9D9D9] transition-all duration-300 ease-out",
              isOn ? "left-[27px]" : "left-[3px]"
            )}
          />
        </span>
      </label>
    )
  }
)

ToggleSwitch.displayName = "ToggleSwitch";