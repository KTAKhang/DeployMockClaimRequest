import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const StatusChart = ({ status }) => {
  const COLORS = {
    Active: "#15803D",
    Inactive: "#a10c07",
  };

  const textLabel = status ? "Active" : "Inactive";
  const data = [{ name: textLabel, value: 100 }];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart container with proper proportions */}
      <div className="relative flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="80%"
              outerRadius="100%"
              startAngle={0}
              endAngle={360}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={status ? COLORS.Active : COLORS.Inactive} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered status text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-black font-bold text-xs sm:text-base md:text-xl">
            {textLabel}
          </span>
        </div>
      </div>

      {/* Legend as separate element with fixed positioning */}
      <div className="flex justify-center mt-2 md:mt-4">
        <div className="flex space-x-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-1">
            <div
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: COLORS.Active }}
            ></div>
            <span className="text-gray-700">Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <div
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: COLORS.Inactive }}
            ></div>
            <span className="text-gray-700">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChart;
