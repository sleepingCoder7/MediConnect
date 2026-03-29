import { createSlice } from "@reduxjs/toolkit";

const appointmentSlice = createSlice({
    name: "appointment",
    initialState: {
        data: [],
        loading: false,
    },
    reducers: {
        setAppointments: (state, action) => {
            state.data = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        removeAppointment: (state, action) => {
            state.data = state.data.filter((appointment) => appointment._id !== action.payload);
        },
    },
});

export const { setAppointments, removeAppointment, setLoading } = appointmentSlice.actions;
export default appointmentSlice.reducer;