export const handleConfirmAction = (setIsProcessing, onConfirm) => {
    setIsProcessing(true);
    setTimeout(() => {
        onConfirm();
        setIsProcessing(false);
    }, 1500); // Simulate processing delay
};
