import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

// eslint-disable-next-line react/prop-types
export default function Modal({ isOpen, onClose, onConfirm, actionType, source, }) {
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const requiresReason = [
    "Approve",
    "Reject",
    "ApproveAll",
    "RejectAll",
  ].includes(actionType);
  const showReasonInput = source === "ClaimsTable" && requiresReason;

  const actionMessages = {
    Approve: "approve this claim",
    ApproveAll: "approve selected claims",
    Reject: "reject this claim",
    RejectAll: "reject selected claims",
    Delete: "delete this claim",
    DeleteAll: "delete selected claims",
    Submit: "submit this claim",
    Cancel: "cancel this claim",
    Cancelled: "cancel this claim",
    SubmitAll: "submit all claim",
    CancelAll: "cancel all claim",
    DownloadAll: "download selected claim",
    PayAll: "mark selected claims as paid",
    Paid: "mark this claim as paid",
  };

  const colors = {
    Approve: "bg-green-400",
    ApproveAll: "bg-green-400",
    Reject: "bg-red-400",
    RejectAll: "bg-red-400",
    Delete: "bg-red-500",
    DeleteAll: "bg-red-500",
    Submit: "bg-green-500",
    Cancel: "bg-red-500",
    DownloadAll: "bg-green-400",
    PayAll: "bg-green-400",
    Paid: "bg-blue-400",
    Cancelled: "bg-red-500",
    SubmitAll: "bg-green-400",
    CancelAll: "bg-red-500",
  };

  const handleConfirm = () => {


    if (showReasonInput && !reason.trim()) {
      toast.error("⚠️ Please enter a reason before proceeding.", {
        position: "top-center",
        autoClose: 3000, // Auto-close after 3 seconds
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      if (actionMessages[actionType]) {
        // console.log(`Action Triggered: ${actionMessages[actionType]}`);
      } else {
        // console.warn("No specific action found for:", actionType);
      }

      onConfirm(reason);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg w-96 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Icon */}
            <div className="text-blue-900 text-5xl mb-2">ℹ️</div>
            <h2 className="text-lg font-bold text-blue-900">CONFIRMATION</h2>
            <p className="mt-2 text-gray-700">
              Are you sure you want to <b>{actionMessages[actionType]}?</b>
              <br />
              This action cannot be undone.
            </p>

            {/* Reason Input (Keeps your original logic intact) */}
            {showReasonInput && (
              <textarea
                className="w-full mt-4 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isProcessing}
              />
            )}

            {/* Buttons */}
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={handleConfirm}
                disabled={isProcessing}


                className={`px-6 py-2 rounded-lg bg-green-400 text-white font-semibold ${isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : colors[actionType]
                  }`}
              >
                {isProcessing ? "Processing..." : "Yes"}
              </button>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 py-2 rounded-lg bg-red-200 text-red-600 font-semibold"
              >
                No
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
