import { SET_CUSTOMER } from '../actions/actions';

const initialState = {
    id: '',
    name: ''
}

const customerDetailsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CUSTOMER:
            return {
                ...state,
                id: action.customerId,
                name: action.customerName,
            }
        default:
            return state;
    }
}

export default customerDetailsReducer;
