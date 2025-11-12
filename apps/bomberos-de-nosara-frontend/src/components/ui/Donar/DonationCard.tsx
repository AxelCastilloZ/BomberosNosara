import React from 'react';
import { DonationCardProps } from './types';

export const DonationCard: React.FC<DonationCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  onButtonClick,
  benefits,
  highlighted = false,
}) => {
  const cardClasses = highlighted
    ? 'bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-2xl hover:shadow-xl transition-all duration-300 flex flex-col'
    : 'bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col';

  const iconContainerClasses = highlighted
    ? 'bg-red-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-white'
    : 'bg-gray-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-white';

  const titleClasses = highlighted
    ? 'text-3xl font-serif mb-4 text-center text-red-800'
    : 'text-2xl font-serif mb-4 text-center';

  const buttonClasses = highlighted
    ? 'w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300'
    : 'w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300';

  return (
    <div className={cardClasses}>
      <div className={iconContainerClasses}>
        {icon}
      </div>

      <h3 className={titleClasses}>
        {title}
      </h3>

      <p className="text-gray-600 mb-6 text-center flex-grow">
        {description}
      </p>

      {benefits && benefits.length > 0 && (
        <ul className="text-sm text-gray-600 mb-6 space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-red-600">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onButtonClick}
        className={buttonClasses}
      >
        {buttonText}
      </button>
    </div>
  );
};
