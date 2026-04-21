import React from 'react';
import { SpinnerProps } from './types';

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export default Spinner;
