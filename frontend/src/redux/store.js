import { configureStore } from '@reduxjs/toolkit'
import appointmentReducer from './slices/appointmentSlice';

export const store = configureStore({
    reducer: { appointment: appointmentReducer },
})