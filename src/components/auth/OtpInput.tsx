import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { Input, Space } from 'antd';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [localValues, setLocalValues] = useState<string[]>(
    value.split('').concat(Array(length - value.length).fill(''))
  );

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return;

    const newValues = [...localValues];
    newValues[index] = inputValue.slice(-1);
    setLocalValues(newValues);
    onChange(newValues.join(''));

    if (inputValue && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !localValues[index] && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newValues = pastedData.split('').concat(Array(length - pastedData.length).fill(''));
    setLocalValues(newValues);
    onChange(newValues.join(''));
    focusInput(Math.min(pastedData.length, length - 1));
  };

  return (
    <Space size="small">
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el?.input || null;
          }}
          value={localValues[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={1}
          style={{
            width: 48,
            height: 48,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 600,
          }}
        />
      ))}
    </Space>
  );
};
