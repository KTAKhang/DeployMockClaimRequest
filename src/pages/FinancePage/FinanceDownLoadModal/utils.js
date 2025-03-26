

import { MONTH_MIN, MONTH_MAX, YEAR_MIN, YEAR_MAX } from './constants';

export const validateMonth = (month) => {
    return month && month >= MONTH_MIN && month <= MONTH_MAX;
};

export const validateYear = (year) => {
    return year && year >= YEAR_MIN && year <= YEAR_MAX;
};

export const formatErrorMessage = (field) => {
    if (field === 'month') {
        return `Month must be between ${MONTH_MIN} and ${MONTH_MAX}`;
    }
    if (field === 'year') {
        return `Year must be between ${YEAR_MIN} and ${YEAR_MAX}`;
    }
    return '';
};