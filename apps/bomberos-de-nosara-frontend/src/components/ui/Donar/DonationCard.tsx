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
    "rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 font-[Poppins] h-full";
  const cardClasses = highlighted
    ? `bg-red-50 border-2 border-red-200 shadow-2xl hover:shadow-xl ${baseClasses}`
    : `bg-white shadow-lg hover:shadow-xl ${baseClasses}`;

  const iconContainer = highlighted
    ? "bg-red-800 backdrop-blur-sm border border-white/30 text-white"
    : "bg-gray-700 text-white";

  const titleClasses = highlighted
    ? "text-3xl font-extrabold text-[#B22222] text-center mb-4"
    : "text-2xl font-bold text-[#111111] text-center mb-4";

  const buttonClasses = highlighted
    ? "bg-red-800 backdrop-blur-sm border border-white/30 text-white font-medium rounded-3xl hover:bg-red-700 transition"
    : "bg-gray-700 text-white font-medium rounded-3xl hover:bg-gray-800 transition";

  return (
    <div className={cardClasses}>
      {/* Parte superior */}
      <div className="flex flex-col items-center flex-grow">
        <div
          className={`${iconContainer} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}
        >
          {icon}
        </div>

        <h3 className={titleClasses}>{title}</h3>

        <p className="text-gray-700 mb-6 text-center">{description}</p>

        {benefits && (
          <ul className="text-sm text-gray-600 mb-6 space-y-2 text-left mx-auto">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2 text-red-700">✓</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botón */}
      <div className="mt-auto pt-4">
        <button
          onClick={onButtonClick}
          className={`${buttonClasses} w-full py-3 px-6 shadow-md hover:shadow-lg`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
