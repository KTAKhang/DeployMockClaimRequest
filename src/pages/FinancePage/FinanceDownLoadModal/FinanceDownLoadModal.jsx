
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { downloadClaimsRequest, resetDownloadStatus } from '../../../redux/actions/financeAction';
import { validateMonth, validateYear, formatErrorMessage } from './utils';
import { DOWNLOAD_MODAL_STRINGS } from './strings';
import { MONTH_MIN, MONTH_MAX, YEAR_MIN, YEAR_MAX } from './constants';

const FinanceDownLoadModal = ({ isOpenDownloadModal, setIsOpenDownloadModal }) => {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [errors, setErrors] = useState({ month: '', year: '' });

    const dispatch = useDispatch();
    const { error } = useSelector((state) => state.finance || {});
    const downloadSusses = useSelector((state) => state.finance.downloadSusses);
    const isDownloadLoading = useSelector((state) => state.finance.isDownloadLoading);

    useEffect(() => {
        if (downloadSusses) {
            setIsOpenDownloadModal(false);
            setMonth("");
            setYear("");
            toast.success(DOWNLOAD_MODAL_STRINGS.DOWNLOAD_SUCCESS);
            dispatch(resetDownloadStatus());
        }
    }, [downloadSusses, dispatch, setIsOpenDownloadModal]);

    useEffect(() => {
        if (error) {
            setErrors({ ...errors });
            toast.error(DOWNLOAD_MODAL_STRINGS.DOWNLOAD_FAILURE);
            setMonth("");
            setYear("");
        }
    }, [error]);

    const handleSubmit = () => {
        let newErrors = { month: '', year: '' };
        let valid = true;

        if (!validateMonth(month)) {
            newErrors.month = formatErrorMessage('month');
            valid = false;
        }
        if (!validateYear(year)) {
            newErrors.year = formatErrorMessage('year');
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        dispatch(downloadClaimsRequest(month, year));
    };

    return (
        isOpenDownloadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{DOWNLOAD_MODAL_STRINGS.TITLE}</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{DOWNLOAD_MODAL_STRINGS.MONTH_LABEL}</label>
                            <input
                                type="number"
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value, 10) || '')}
                                className={`mt-1 w-full border rounded-lg shadow-sm focus:ring ${errors.month ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={DOWNLOAD_MODAL_STRINGS.MONTH_PLACEHOLDER}
                                min={MONTH_MIN}
                                max={MONTH_MAX}
                            />
                            {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{DOWNLOAD_MODAL_STRINGS.YEAR_LABEL}</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value, 10) || '')}
                                className={`mt-1 w-full border rounded-lg shadow-sm focus:ring ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={DOWNLOAD_MODAL_STRINGS.YEAR_PLACEHOLDER}
                                min={YEAR_MIN}
                                max={YEAR_MAX}
                            />
                            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 space-x-4">
                        {isDownloadLoading ? (
                            <>
                                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">{DOWNLOAD_MODAL_STRINGS.CANCEL_BUTTON}</button>
                                <button disabled className="px-6 py-2 rounded-lg text-white font-semibold bg-gray-400 cursor-not-allowed">{DOWNLOAD_MODAL_STRINGS.PROCESSING_BUTTON}</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsOpenDownloadModal(false)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">{DOWNLOAD_MODAL_STRINGS.CANCEL_BUTTON}</button>
                                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{DOWNLOAD_MODAL_STRINGS.DOWNLOAD_BUTTON}</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    );
};

export default FinanceDownLoadModal;