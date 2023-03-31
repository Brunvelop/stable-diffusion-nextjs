import React from 'react';

const YellowButton = ({ onClick, children, ...rest }) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="text-current font-bold bg-yellow-300 px-14 py-1.5 border-4 border-black mr-6 last:mr-0 transition-all duration-200 ease-in transform hover:shadow-[0_05px_05px_rgba(0,0,0,.5)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-x-0 active:translate-y-0"
      {...rest}
    >
      {children}
    </button>
  );
};

export default YellowButton;