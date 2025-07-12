/**
 * Reusable authentication input component
 * Provides consistent styling for form inputs with error handling
 * Now uses the modern Figma floating label design
 */

import { FormField } from '../ui/FigmaFloatingLabelInput';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function AuthInput({ label, error, onChange, ...props }: AuthInputProps) {
  // Handle the onChange event to convert from React.ChangeEvent to string value
  const handleChange = (value: string) => {
    if (onChange) {
      // Create a synthetic event that mimics the original onChange
      const syntheticEvent = {
        target: { value }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="mb-5">
      <FormField
        label={label}
        value={props.value as string || ''}
        onChange={handleChange}
        type={props.type || 'text'}
        placeholder={props.placeholder}
        disabled={props.disabled}
        className="w-full"
      />
      {error && (
        <p className="mt-1 text-error text-sm">{error}</p>
      )}
    </div>
  );
} 