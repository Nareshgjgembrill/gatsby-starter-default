export const SET_CUSTOMER = 'SET_CUSTOMER';

/**
 * Change current customer
 */
export function setCustomer(customerId, customerName) {
    return { type: SET_CUSTOMER, customerId, customerName };
}
