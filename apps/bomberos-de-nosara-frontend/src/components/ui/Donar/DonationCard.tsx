import React from "react";
import type { DonationCardProps } from "./types";

export const DonationCard: React.FC<DonationCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  onButtonClick,
  benefits,
  highlighted = false,
}) => {
  const baseClasses =
    "rounded-2xl p-8 flex flex-col transition-all duration-300 font-[Poppins]";
  const cardClasses = highlighted
    ? `bg-red-50 border-2 border-red-200 shadow-2xl hover:shadow-xl ${baseClasses}`
    : `bg-white shadow-lg hover:shadow-xl ${baseClasses}`;

  const iconContainer = highlighted
    ? "bg-[#B22222] text-white"
    : "bg-gray-600 text-white";

  const titleClasses = highlighted
    ? "text-3xl font-extrabold text-[#B22222] text-center mb-4"
    : "text-2xl font-bold text-[#111111] text-center mb-4";

  const buttonClasses = highlighted
    ? "bg-[#B22222] hover:bg-[#8B1B1B]"
    : "bg-gray-600 hover:bg-gray-700";

  return (
    <div className={cardClasses}>
      <div
        className={`${iconContainer} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}
      >
        {icon}
      </div>

      <h3 className={titleClasses}>{title}</h3>

      <p className="text-gray-700 mb-6 text-center">{description}</p>

      {benefits && (
        <ul className="text-sm text-gray-600 mb-6 space-y-2">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-2 text-[#B22222]">✓</span>
              {b}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onButtonClick}
        className={`${buttonClasses} w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300`}
      >
        {buttonText}
      </button>
    </div>
  );
};
