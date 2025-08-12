import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";

export interface InputTokenAmountProps {
  token: TokenInfo;
  value: string;
  onChange: (value: string) => void;
  maxAmount?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const InputTokenAmount: React.FC<InputTokenAmountProps> = ({
  token,
  value,
  onChange,
  maxAmount,
  className,
  placeholder = "0.00",
  disabled = false,
}) => {
  const handleMaxClick = () => {
    if (maxAmount && !disabled) {
      onChange(maxAmount);
    }
  };

  const formatValue = (inputValue: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanedValue = inputValue.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = cleanedValue.split(".");
    if (parts.length > 2) {
      return `${parts[0] ?? ""}.${parts.slice(1).join("")}`;
    }

    // Limit decimal places to token decimals
    if (parts.length === 2 && parts[1] && parts[1].length > token.decimals) {
      return `${parts[0] ?? ""}.${parts[1].substring(0, token.decimals)}`;
    }

    return cleanedValue;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatValue(e.target.value);
    onChange(formattedValue);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center space-x-3 rounded-md border border-input bg-transparent p-3 shadow-sm transition-colors focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {token.icon && (
            <img
              src={token.icon}
              alt={token.symbol}
              className="w-6 h-6 rounded-full flex-shrink-0"
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className="border-0 p-0 text-xl font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              style={{ outline: "none", boxShadow: "none" }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {maxAmount && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMaxClick}
              disabled={disabled}
              className="h-6 px-2 py-1 text-xs font-medium"
            >
              MAX
            </Button>
          )}
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {token.symbol}
            </div>
            {token.name && (
              <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                {token.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
