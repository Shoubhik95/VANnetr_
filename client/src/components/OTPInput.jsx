import React, { useRef, useEffect } from 'react';

export default function OTPInput({ value = '', onChange, length = 6, disabled = false, error = false }) {
  const inputRefs = useRef([]);

  // Array of digits based on current value string
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Auto-focus first input box on render
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Extract last entered character, ensure it's numeric
    const newDigit = val.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = newDigit;
    const combined = newDigits.join('');
    onChange(combined);

    // Auto-advance to next input box
    if (newDigit && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move back to previous box on backspace if current is empty
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current digit
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length, length - 1);
      if (inputRefs.current[targetIndex]) {
        inputRefs.current[targetIndex].focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 my-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of OTP`}
          className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-bold font-mono rounded-xl border transition-all outline-none ${
            error 
              ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500/50' 
              : digits[index]
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm'
                : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-black focus:ring-2 focus:ring-black/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
}
