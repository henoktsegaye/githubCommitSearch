import React, { useState, ReactNode } from "react";
import classNames from "classnames";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  color?: "primary" | "secondary";
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  active?: boolean;
};

const Button = ({
  children,
  variant = "solid",
  color = "primary",
  icon,
  disabled = false,
  loading = false,
  active = false,
  onClick,
}: ButtonProps) => {
  // button classes are defined in button.css
  const buttonClasses = classNames(
    "px-4 py-2 flex font-bold rounded-md focus:outline-none transition-all",
    {
      "bg-primary text-white": variant === "solid" || variant === "ghost",
      "border-2 border-primary text-primary hover:bg-primary hover:text-white":
        variant === "outline",
      "bg-transparent text-primary hover:bg-primary hover:text-white":
        variant === "ghost",
      "bg-gray-400 text-gray-700 cursor-not-allowed": disabled,
      relative: loading,
    }
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      e.preventDefault();
    } else {
      onClick && onClick();
    }
  };
  const loadingClasses = classNames(
    " inset-0 flex mr-2 transition-all items-center justify-center",
    {
      "text-white": color === "primary",
      "text-secondary": color === "secondary",
    }
  );

  return (
    <button className={buttonClasses} onClick={handleClick}>
      {loading && (
        <span className={loadingClasses}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <circle cx="4" cy="12" r="2">
              <animate
                attributeName="cy"
                values="10;16;10"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="12" cy="12" r="2">
              <animate
                attributeName="cy"
                values="10;16;10"
                dur="1s"
                begin="0.1s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="20" cy="12" r="2">
              <animate
                attributeName="cy"
                values="10;16;10"
                dur="1s"
                begin="0.2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </span>
      )}

      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
