import React from "react";
const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      <p className="text-gray-500 text-sm mt-4">{message}</p>
    </div>
  );
};

export default Loading;
