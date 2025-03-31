import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClaimModal from "../ClaimModal/ClaimModal";
import { fetchProjectsRequest, createClaimRequest } from "../../../redux/actions/claimerActions";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import từ các file đã tách
import { 
    DEFAULT_TIMES, 
    CLAIM_STATUS, 
    ROUTES, 
    FIELD_NAMES, 
    ACTION_TYPES,
    TIMER_CONSTANTS,
    TOAST_CONFIG
} from "./constants";
import { 
    PAGE_STRINGS, 
    FIELD_LABELS, 
    BUTTON_STRINGS, 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    SELECT_OPTIONS,
    TOTALS_STRINGS
} from "./strings";
import {
    getDayOfWeek,
    getCurrentDate,
    calculateTotalHours,
    formatClaimData,
    createNewClaimRow,
    getUserNameFromStorage,
    validateClaimForm
} from "./utils";

export default function CreateClaim() {
    const dispatch = useDispatch();
    const { projects, projectsLoading, createClaimLoading, createClaimError, createClaimSuccess } = useSelector((state) => state.claimer);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        [FIELD_NAMES.STAFF_NAME]: "",
        [FIELD_NAMES.PROJECT_NAME]: "",
        [FIELD_NAMES.REASON_CLAIMER]: "",
    });

    const [claimRows, setClaimRows] = useState([
        createNewClaimRow(
            1, 
            getCurrentDate(), 
            DEFAULT_TIMES.START_TIME, 
            DEFAULT_TIMES.END_TIME
        )
    ]);

    // State để quản lý lỗi
    const [errors, setErrors] = useState({
        [FIELD_NAMES.PROJECT_NAME]: "",
        claimRows: [{}]
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState("");

    // State để theo dõi trạng thái submit/save
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchProjectsRequest());
        const userName = getUserNameFromStorage();
        if (userName) {
            setForm(prev => ({
                ...prev,
                [FIELD_NAMES.STAFF_NAME]: userName
            }));
        }
    }, [dispatch]);


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === FIELD_NAMES.PROJECT_NAME) {
            setErrors(prev => ({ ...prev, [FIELD_NAMES.PROJECT_NAME]: "" }));
        }
    };

    const handleClaimRowChange = (index, field, value) => {
        setClaimRows(prev => {
            const newRows = [...prev];

            // Xử lý đặc biệt cho from_date và to_date
            if (field === FIELD_NAMES.FROM_DATE || field === FIELD_NAMES.TO_DATE) {
                const currentRow = newRows[index];

                if (field === FIELD_NAMES.FROM_DATE) {
                    // Nếu đã có to_date và from_date mới lớn hơn to_date
                    if (currentRow[FIELD_NAMES.TO_DATE] && value > currentRow[FIELD_NAMES.TO_DATE]) {
                        toast.error(ERROR_MESSAGES.FROM_DATE_BEFORE_TO, {
                            position: TOAST_CONFIG.POSITION,
                            autoClose: TOAST_CONFIG.AUTO_CLOSE
                        });
                        return prev; // Giữ nguyên state cũ
                    }
                }

                if (field === FIELD_NAMES.TO_DATE) {
                    // Nếu đã có from_date và to_date mới nhỏ hơn from_date
                    if (currentRow[FIELD_NAMES.FROM_DATE] && value < currentRow[FIELD_NAMES.FROM_DATE]) {
                        toast.error(ERROR_MESSAGES.TO_DATE_AFTER_FROM, {
                            position: TOAST_CONFIG.POSITION,
                            autoClose: TOAST_CONFIG.AUTO_CLOSE
                        });
                        return prev; // Giữ nguyên state cũ
                    }
                }
            }

            newRows[index] = {
                ...newRows[index],
                [field]: value,
                // Chỉ cập nhật day khi thay đổi date
                ...(field === FIELD_NAMES.DATE ? { [FIELD_NAMES.DAY]: getDayOfWeek(value) } : {}),
            };

            // Xóa lỗi khi người dùng sửa giá trị
            setErrors(prev => {
                const newErrors = { ...prev };
                if (newErrors.claimRows && newErrors.claimRows[index]) {
                    newErrors.claimRows[index][field] = "";
                }
                return newErrors;
            });

            return newRows;
        });
    };

    const addClaimRow = () => {
        const currentDateTime = getCurrentDate();
        setClaimRows(prev => [
            ...prev, 
            createNewClaimRow(
                prev.length + 1, 
                currentDateTime, 
                DEFAULT_TIMES.START_TIME, 
                DEFAULT_TIMES.END_TIME
            )
        ]);
    };

    const removeClaimRow = (index) => {
        if (claimRows.length > 1) {
            setClaimRows(prev => prev.filter((_, i) => i !== index));
        }
    };

    const openModal = (type) => {
        setActionType(type);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleConfirm = () => {
        const { isValid, errors: newErrors } = validateClaimForm(form, claimRows);
        setErrors(newErrors);
        
        if (!isValid) {
            closeModal();
            return;
        }

        setIsSubmitting(true); // Bắt đầu quá trình submit/save

        switch (actionType) {
            case ACTION_TYPES.SAVE:
                handleSave();
                break;
            case ACTION_TYPES.SUBMIT:
                handleSubmit();
                break;
            case ACTION_TYPES.CANCEL:
                closeModal();
                navigate(ROUTES.DRAFT);
                break;
            default:
                break;
        }
        closeModal();
    };

    const handleSubmit = () => {
        const claim = claimRows[0];
        const formattedData = formatClaimData(
            claim, 
            form[FIELD_NAMES.PROJECT_NAME], 
            CLAIM_STATUS.PENDING
        );
        console.log("Submit data:", formattedData);
        dispatch(createClaimRequest(formattedData));
    };

    const handleSave = () => {
        const claim = claimRows[0];
        const formattedData = formatClaimData(
            claim, 
            form[FIELD_NAMES.PROJECT_NAME], 
            CLAIM_STATUS.DRAFT
        );
        console.log("Save data:", formattedData);
        dispatch(createClaimRequest(formattedData));
    };

    // Xử lý thông báo thành công
    useEffect(() => {
        if (createClaimSuccess && isSubmitting) {
            toast.success(SUCCESS_MESSAGES.CLAIM_CREATED, {
                position: TOAST_CONFIG.POSITION,
                autoClose: TOAST_CONFIG.AUTO_CLOSE,
                hideProgressBar: TOAST_CONFIG.HIDE_PROGRESS_BAR,
                closeOnClick: TOAST_CONFIG.CLOSE_ON_CLICK,
                pauseOnHover: TOAST_CONFIG.PAUSE_ON_HOVER,
                draggable: TOAST_CONFIG.DRAGGABLE,
            });

            // Delay chuyển trang
            const timer = setTimeout(() => {
                if (actionType === ACTION_TYPES.SAVE) {
                    navigate(ROUTES.DRAFT);
                } else if (actionType === ACTION_TYPES.SUBMIT) {
                    navigate(ROUTES.PENDING);
                }
                setIsSubmitting(false);
            }, TIMER_CONSTANTS.REDIRECT_DELAY);

            return () => clearTimeout(timer);
        }
    }, [createClaimSuccess, actionType, navigate, isSubmitting]);

    // Xử lý thông báo lỗi
    useEffect(() => {
        if (createClaimError) {
            toast.error(createClaimError, {
                position: TOAST_CONFIG.POSITION,
                autoClose: TOAST_CONFIG.AUTO_CLOSE_ERROR,
                hideProgressBar: TOAST_CONFIG.HIDE_PROGRESS_BAR,
                closeOnClick: TOAST_CONFIG.CLOSE_ON_CLICK,
                pauseOnHover: TOAST_CONFIG.PAUSE_ON_HOVER,
                draggable: TOAST_CONFIG.DRAGGABLE,
            });
            setIsSubmitting(false);
        }
    }, [createClaimError]);

    // Cập nhật useEffect để cập nhật cả date và time
    useEffect(() => {
        const timer = setInterval(() => {
            const currentDateTime = getCurrentDate();
            setClaimRows(prev => prev.map(row => ({
                ...row,
                [FIELD_NAMES.DATE]: currentDateTime.date,
                [FIELD_NAMES.TIME]: currentDateTime.time,
                [FIELD_NAMES.DAY]: getDayOfWeek(currentDateTime.date)
            })));
        }, TIMER_CONSTANTS.INTERVAL);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="py-0 px-2 sm:px-4 md:px-6 w-full">
            <p className="text-gray-500 mb-2">{PAGE_STRINGS.BREADCRUMB}</p>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 mt-4">{PAGE_STRINGS.TITLE}</h2>

            {/* Claim Details */}
            <div className="mb-6">
                {/* Basic Information */}
                <div className="mb-6 p-3 sm:p-4 border rounded-lg bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block font-bold mb-2">
                                {FIELD_LABELS.STAFF_NAME} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name={FIELD_NAMES.STAFF_NAME}
                                value={form[FIELD_NAMES.STAFF_NAME]}
                                className="border rounded p-2 sm:p-3 w-full h-10 sm:h-12 bg-gray-50"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-2">
                                {FIELD_LABELS.PROJECT_NAME} <span className="text-red-500">*</span>
                            </label>
                            <select
                                name={FIELD_NAMES.PROJECT_NAME}
                                value={form[FIELD_NAMES.PROJECT_NAME]}
                                onChange={handleFormChange}
                                className={`border rounded p-2 sm:p-3 w-full h-10 sm:h-12 ${errors[FIELD_NAMES.PROJECT_NAME] ? "border-red-500" : ""}`}
                                disabled={projectsLoading}
                                required
                            >
                                <option value="">{SELECT_OPTIONS.DEFAULT_PROJECT}</option>
                                {projects
                                    .filter(project => project.status === true)
                                    .map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.project_name}
                                        </option>
                                    ))
                                }
                            </select>
                            {errors[FIELD_NAMES.PROJECT_NAME] && (
                                <span className="text-red-500 text-sm">{errors[FIELD_NAMES.PROJECT_NAME]}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Claim Rows */}
                {claimRows.map((row, index) => (
                    <div key={row.id} className="mb-6 p-3 sm:p-4 border rounded-lg bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4">
                            <div>
                                <label className="block font-bold mb-2">
                                    {FIELD_LABELS.DATE}
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="date"
                                        value={row[FIELD_NAMES.DATE]}
                                        className="border rounded p-2 sm:p-3 w-full bg-gray-50"
                                        readOnly
                                    />
                                    <input
                                        type="time"
                                        value={row[FIELD_NAMES.TIME]}
                                        step="1"
                                        className="border rounded p-2 sm:p-3 w-full sm:w-40 bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{FIELD_LABELS.DAY}</label>
                                <input
                                    type="text"
                                    value={row[FIELD_NAMES.DAY]}
                                    className="border rounded p-2 sm:p-3 w-full bg-gray-50"
                                    readOnly
                                />
                            </div>
                            <div className="flex justify-end items-end mt-2 sm:mt-0">
                                {claimRows.length > 1 && (
                                    <button
                                        onClick={() => removeClaimRow(index)}
                                        className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-600 text-sm sm:text-base"
                                    >
                                        {BUTTON_STRINGS.REMOVE}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4">
                            <div>
                                <label className="block font-bold mb-2">
                                    {FIELD_LABELS.DATE_FROM} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="date"
                                        value={row[FIELD_NAMES.FROM_DATE]}
                                        onChange={(e) => handleClaimRowChange(index, FIELD_NAMES.FROM_DATE, e.target.value)}
                                        max={row[FIELD_NAMES.TO_DATE] || undefined}
                                        className={`border rounded p-2 sm:p-3 w-full ${errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.FROM_DATE] ? "border-red-500" : ""}`}
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={row[FIELD_NAMES.FROM_TIME]}
                                        onChange={(e) => handleClaimRowChange(index, FIELD_NAMES.FROM_TIME, e.target.value)}
                                        className="border rounded p-2 sm:p-3 w-full sm:w-50"
                                        style={{ paddingRight: '25px' }}
                                        required
                                    />
                                </div>
                                {errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.FROM_DATE] && (
                                    <span className="text-red-500 text-sm">{errors.claimRows[index][FIELD_NAMES.FROM_DATE]}</span>
                                )}
                            </div>
                            <div>
                                <label className="block font-bold mb-2">
                                    {FIELD_LABELS.DATE_TO} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="date"
                                        value={row[FIELD_NAMES.TO_DATE]}
                                        onChange={(e) => handleClaimRowChange(index, FIELD_NAMES.TO_DATE, e.target.value)}
                                        min={row[FIELD_NAMES.FROM_DATE] || undefined}
                                        className={`border rounded p-2 sm:p-3 w-full ${errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.TO_DATE] ? "border-red-500" : ""}`}
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={row[FIELD_NAMES.TO_TIME]}
                                        onChange={(e) => handleClaimRowChange(index, FIELD_NAMES.TO_TIME, e.target.value)}
                                        className="border rounded p-2 sm:p-3 w-full sm:w-54"
                                        style={{ paddingRight: '25px' }}
                                        required
                                    />
                                </div>
                                {errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.TO_DATE] && (
                                    <span className="text-red-500 text-sm">{errors.claimRows[index][FIELD_NAMES.TO_DATE]}</span>
                                )}
                            </div>
                            <div>
                                <label className="block font-bold mb-2">
                                    {FIELD_LABELS.TOTAL_WORKING_HOURS} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={row[FIELD_NAMES.TOTAL_HOURS]}
                                    onChange={(e) => handleClaimRowChange(index, FIELD_NAMES.TOTAL_HOURS, e.target.value)}
                                    className={`border rounded p-2 sm:p-3 w-full ${errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.TOTAL_HOURS] ? "border-red-500" : ""}`}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                {errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.TOTAL_HOURS] && (
                                    <span className="text-red-500 text-sm">{errors.claimRows[index][FIELD_NAMES.TOTAL_HOURS]}</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold mb-2">
                                {FIELD_LABELS.REASON} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={row[FIELD_NAMES.REASON_CLAIMER]}
                                onChange={(e) => handleClaimRowChange(index, FIELD_NAMES.REASON_CLAIMER, e.target.value)}
                                className={`border rounded p-2 sm:p-3 w-full ${errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.REASON_CLAIMER] ? "border-red-500" : ""}`}
                                required
                            />
                            {errors.claimRows && errors.claimRows[index]?.[FIELD_NAMES.REASON_CLAIMER] && (
                                <span className="text-red-500 text-sm">{errors.claimRows[index][FIELD_NAMES.REASON_CLAIMER]}</span>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-0">
                        <span className="font-bold">{TOTALS_STRINGS.TOTAL_WORKING_HOURS}</span>
                        <span className="text-base sm:text-lg">{calculateTotalHours(claimRows)}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end space-x-4">
                <button
                    className="px-6 py-2 w-28 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    onClick={() => openModal(ACTION_TYPES.SAVE)}
                >
                    {BUTTON_STRINGS.SAVE}
                </button>
                <button
                    className="px-6 py-2 w-28 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold"
                    onClick={() => openModal(ACTION_TYPES.SUBMIT)}
                >
                    {BUTTON_STRINGS.SUBMIT}
                </button>
            </div>

            {/* Popup Modal */}
            <ClaimModal
                isOpen={modalOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                actionType={actionType}
            />

            {/* Loading overlay */}
            {createClaimLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
}
