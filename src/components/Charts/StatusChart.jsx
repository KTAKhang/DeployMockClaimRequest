import { PieChart, Pie, Cell } from "recharts";

const StatusChart = ({ status }) => {
  const COLORS = {
    Active: "#15803D", 
    Inactive: "#A16207", 
  };

  const textLabel = status ? "Active" : "Inactive";
  const data = [{ name: textLabel, value: 100 }];

  return (
    <div className="flex justify-center items-center h-full">
      {/* Biểu đồ lớn hơn */}
      <div className="relative flex items-center">
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70} // Tăng kích thước vòng trong
            outerRadius={100} // Làm vòng tròn lớn hơn
            startAngle={0}
            endAngle={360}
            dataKey="value"
            stroke="none" // Làm viền dày hơn
          >
            <Cell fill={status ? COLORS.Active : COLORS.Inactive} />
          </Pie>
        </PieChart>
        {/* Chữ hiển thị ở giữa */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-black font-bold text-2xl">{textLabel}</span>
        </div>
      </div>

      {/* Chú thích nằm ngang bên cạnh */}
      <div className="flex flex-col space-y-10 ml-6">
        {/* Complete */}
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: COLORS.Active }}
          ></div>
          <span className="text-black font-semibold text-lg">Active</span>
        </div>

        {/* In Progress */}
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: COLORS.Inactive }}
          ></div>
          <span className="text-black font-semibold text-lg">Inactive</span>
        </div>
      </div>
    </div>
  );
};

export default StatusChart;
