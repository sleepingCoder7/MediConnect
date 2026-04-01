import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookAppointment from '../BookAppointment';
import { MemoryRouter } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

vi.mock('../../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar Mock</div>,
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
    }
}));

describe('BookAppointment Component', () => {
    const mockUser = {
        profile: {
            phone: '1234567890'
        }
    };

    const mockDepartments = [
        { _id: 'd1', name: 'Cardiology' },
        { _id: 'd2', name: 'Neurology' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser });
        vi.mocked(API.get).mockResolvedValue({ data: mockDepartments });
    });

    const renderComponent = () => render(
        <MemoryRouter>
            <BookAppointment />
        </MemoryRouter>
    );

    it('renders form and fetches departments on load', async () => {
        renderComponent();
        
        expect(screen.getByRole('heading', { name: /book an appointment/i })).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/departments');
            expect(screen.getByRole('option', { name: 'Cardiology' })).toBeInTheDocument();
        });
        
        expect(screen.getByLabelText('Phone Number')).toHaveValue('1234567890');
    });

    it('validates phone number on change', async () => {
        const user = userEvent.setup();
        renderComponent();
        
        const phoneInput = screen.getByLabelText('Phone Number');
        
        await user.clear(phoneInput);
        await user.type(phoneInput, 'invalid');
        expect(screen.getByText('Phone number must contain only numbers')).toBeInTheDocument();

        await user.clear(phoneInput);
        await user.type(phoneInput, '12345');
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument();
        
        await user.clear(phoneInput);
        await user.type(phoneInput, '0987654321');
        expect(screen.queryByText(/Phone number must contain only numbers|Phone number must be at least 10 digits/)).not.toBeInTheDocument();
    });

    it('validates time selection to be within 9 AM and 9 PM', async () => {
        renderComponent();
        
        const dateInput = screen.getByLabelText('Select Date and time');
        
        const invalidDateStr = '2026-05-10T08:00';
        fireEvent.change(dateInput, { target: { value: invalidDateStr } });
        
        expect(toast.error).toHaveBeenCalledWith('Appointments can only be booked between 9 AM and 9 PM', expect.any(Object));
        
        expect(dateInput.value).toBe('');

        const validDateStr = '2026-05-10T10:00';
        fireEvent.change(dateInput, { target: { value: validDateStr } });
        
        expect(dateInput.value).toBe(validDateStr);
    });

    it('submits the form successfully with file uploads', async () => {
        const user = userEvent.setup();
        vi.mocked(API.post).mockResolvedValueOnce({ data: { success: true } });
        
        renderComponent();
        
        const dateInput = screen.getByLabelText('Select Date and time');
        const validDateStr = '2026-05-10T10:00';
        fireEvent.change(dateInput, { target: { value: validDateStr } });

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Cardiology' })).toBeInTheDocument();
        });
        
        await user.selectOptions(screen.getByLabelText('Select Department'), 'd1');
        await user.type(screen.getByLabelText('Comments'), 'Some symptoms');
        
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Upload Reports');
        await user.upload(fileInput, file);

        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(toast.loading).toHaveBeenCalledWith('Booking appointment...', expect.any(Object));

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledTimes(1);
            const args = vi.mocked(API.post).mock.calls[0];
            expect(args[0]).toBe('/appointments');
            expect(args[1]).toBeInstanceOf(FormData);
            
            expect(toast.success).toHaveBeenCalledWith('Appointment booked successfully', expect.any(Object));
            expect(mockNavigate).toHaveBeenCalledWith('/my-appointment');
        });
    });

    it('prevents submission if there are validation errors', async () => {
        const user = userEvent.setup();
        renderComponent();
        
        const phoneInput = screen.getByLabelText('Phone Number');
        
        await user.clear(phoneInput);
        await user.type(phoneInput, '12ab');
        await screen.findByText(/must contain only numbers/i); 
        
        const submitBtn = screen.getByRole('button', { name: 'Submit' });
        await user.click(submitBtn);
        
        expect(API.post).not.toHaveBeenCalled();
    });

    it('handles form submission error correctly', async () => {
        const user = userEvent.setup();
        vi.mocked(API.post).mockRejectedValueOnce(new Error('Failed to book'));
        
        renderComponent();
        
        const dateInput = screen.getByLabelText('Select Date and time');
        fireEvent.change(dateInput, { target: { value: '2026-05-10T10:00' } });

        await waitFor(() => expect(screen.getByRole('option', { name: 'Cardiology' })).toBeInTheDocument());
        await user.selectOptions(screen.getByLabelText('Select Department'), 'd1');
        
        await user.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to book appointment', expect.any(Object));
        });
    });
});
