import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
    reducer: { dummy: (state = {}) => state },
})