// ClaimCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { DASHBOARD_TEXTS } from "./strings";

export function ClaimCard({ claim, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.005, backgroundColor: "rgba(255, 255, 255, 1)" }}
      transition={{ duration: 0.2 }}
      className="flex justify-between items-center bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border hover:shadow transition"
    >
      <div>
        <p className="text-sm sm:text-base text-gray-800 font-medium">
          {claim.staff}
        </p>
        <div className="flex items-center gap-1 sm:gap-2 mt-1">
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-1 sm:px-2 py-1 rounded-md">
            {claim.project}
          </span>
          <span className="text-xs text-gray-400">{claim.duration}</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm hover:from-blue-600 hover:to-blue-700 transition shadow"
        onClick={() => navigate(`/approver/vetting/${claim._id || claim.id}`)}
      >
        {DASHBOARD_TEXTS.REVIEW_BUTTON}
      </motion.button>
    </motion.div>
  );
}
