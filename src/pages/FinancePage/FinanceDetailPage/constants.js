export const STATUS_COLORS = {
    text: {
        Approved: 'text-green-500',
        Paid: 'text-blue-500',
        Rejected: 'text-red-500',
        Pending: 'text-yellow-500',
        Cancelled: 'text-pink-500',
        default: 'text-gray-500'
    },
    background: {
        Approved: 'green',
        Paid: 'blue',
        Rejected: 'red',
        Pending: 'yellow',
        Cancelled: 'pink',
        default: 'gray'
    }
};

export const LOCKED_STATUSES = ['paid', 'cancelled', 'rejected'];

export const ROUTES = {
    APPROVED: '/finance/approved',
    PAID: '/finance/paid'
};