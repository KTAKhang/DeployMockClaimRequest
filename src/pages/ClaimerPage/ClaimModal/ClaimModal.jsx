import { useState } from "react";
import { BUTTON_COLORS } from "./constants";
import { handleConfirmAction } from "./utils";
import { STRINGS } from "./strings";

// eslint-disable-next-line react/prop-types
export default function ClaimModal({ isOpen, onClose, onConfirm, actionType }) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                {/* Icon */}
                <div className="text-blue-900 text-5xl mb-2">ℹ️</div>
                <h2 className="text-lg font-bold text-blue-900">{STRINGS.MODAL_TITLE}</h2>
                <p className="mt-2 text-gray-700">
                    {STRINGS.MODAL_MESSAGE} <b>{STRINGS.ACTION_MESSAGES[actionType]}?</b>
                    <br />
                    {STRINGS.MODAL_WARNING}
                </p>

                {/* Buttons */}
                <div className="mt-4 flex justify-center gap-4">
                    <button
                        onClick={() => handleConfirmAction(setIsProcessing, onConfirm)}
                        disabled={isProcessing}
                        className={`px-6 py-2 rounded-lg text-white font-semibold ${isProcessing ? "bg-gray-400 cursor-not-allowed" : BUTTON_COLORS[actionType]
                            }`}
                    >
                        {isProcessing ? STRINGS.BUTTON_PROCESSING : STRINGS.BUTTON_YES}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-6 py-2 rounded-lg bg-red-200 text-red-600 font-semibold"
                    >
                        {STRINGS.BUTTON_NO}
                    </button>
                </div>
            </div>
        </div>
    );
}
