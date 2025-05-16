import React from 'react';
import { Input } from "@/components/ui/input";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-2xl">
      <Input
        type="text"
        placeholder="Your Wallet Address (0x...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 py-3 px-4"
      />
      {value && (
        <div className="mt-1">
          <span className="text-xs text-gray-400">Connected: {`${value.substring(0, 6)}...${value.substring(value.length - 4)}`}</span>
        </div>
      )}
    </div>
  );
};

export default AddressInput;