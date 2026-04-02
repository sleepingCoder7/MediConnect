import React from 'react';
import { render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MyAppointment from '../MyAppointment';
import { MemoryRouter } from 'react-router';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import * as reactRedux from 'react-redux';

// Mock Redux Hooks
vi.mock('react-redux', () => ({
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
}));

// Mock Axios
vi.mock('../../api/axios', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
    }
}));

// Mock UI Wrapper Sidebar
vi.mock('../../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar Mock</div>,
}));

// Mock Toasts
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
    }
}));

// Mock MaterialUI loading icons
vi.mock('@mui/material', () => ({
    CircularProgress: () => <div data-testid="circular-progress">CircularProgress</div>,
}));

describe('MyAppointment Component', () => {
    const mockDispatch = vi.fn();
    
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(reactRedux.useDispatch).mockReturnValue(mockDispatch);
        vi.mocked(reactRedux.useSelector).mockImplementation((selector) => {
            const state = {
                appointment: { data: [], loading: false }
            };
            return selector(state);
        });
        vi.mocked(API.get).mockResolvedValue({ data: { data: [] } });
    });

    const renderComponent = () => render(
        <MemoryRouter>
            <MyAppointment />
        </MemoryRouter>
    );

    it('displays loading state initially', async () => {
        vi.mocked(reactRedux.useSelector).mockImplementation((selector) => {
            return selector({ appointment: { data: [], loading: true } });
        });
        
        renderComponent();
        expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('fetches appointments on mount and dispatches slice actions', async () => {
        const mockAppts = [
            { _id: 'a1', appointmentDate: '2026-05-10T10:00:00.000Z', departmentId: { name: 'Cardiology' }, comments: 'Heart checkup' }
        ];
        API.get.mockResolvedValueOnce({ data: { data: mockAppts } });
        
        renderComponent();
        
        await waitFor(() => { 
            expect (API.get).toHaveBeenCalled(); 
        });
        expect(API.get).toHaveBeenCalledWith('/appointments');
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'appointment/setLoading', payload: true }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'appointment/setAppointments', payload: mockAppts }));
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'appointment/setLoading', payload: false }));
    });

    it('displays no appointments found message', () => {
        renderComponent();
        expect(screen.getByText('No appointments found')).toBeInTheDocument();
    });

    it('renders appointments list correctly', () => {
        const mockAppts = [
            { 
                _id: 'a1', 
                appointmentDate: '2026-05-10T10:00:00.000Z', 
                departmentId: { name: 'Cardiology', image: 'url' }, 
                comments: 'Heart check',
                reports: [{ _id: 'r1', url: 'repo.url', public_id: 'report1.pdf' }]
            }
        ];
        
        vi.mocked(reactRedux.useSelector).mockImplementation((selector) => {
            return selector({ appointment: { data: mockAppts, loading: false } });
        });

        renderComponent();
        
        expect(screen.getByText(/Cardiology/i)).toBeInTheDocument();
        expect(screen.getByText(/Heart check/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'report1.pdf' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel appointment/i })).toBeInTheDocument();
    });

    it('cancels appointment successfully', async () => {
        const mockAppts = [
            { _id: 'a1', appointmentDate: '2026-05-10T10:00:00.000Z' }
        ];
        vi.mocked(reactRedux.useSelector).mockImplementation((selector) => {
            return selector({ appointment: { data: mockAppts, loading: false } });
        });
        
        vi.mocked(API.delete).mockResolvedValueOnce({});
        
        const user = userEvent.setup();
        renderComponent();
        
        await user.click(screen.getByRole('button', { name: /cancel appointment/i }));
        
        expect(toast.loading).toHaveBeenCalledWith('Canceling appointment...', expect.any(Object));
        
        await waitFor(() => {
            expect(API.delete).toHaveBeenCalledWith('/appointments/a1');
            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'appointment/removeAppointment', payload: 'a1' }));
            expect(toast.success).toHaveBeenCalledWith('Appointment canceled successfully', expect.any(Object));
        });
    });

    it('handles cancel appointment failure gracefully without slice removal', async () => {
        const mockAppts = [
            { _id: 'a1', appointmentDate: '2026-05-10T10:00:00.000Z' }
        ];
        vi.mocked(reactRedux.useSelector).mockImplementation((selector) => {
            return selector({ appointment: { data: mockAppts, loading: false } });
        });
        
        vi.mocked(API.delete).mockRejectedValueOnce(new Error('Delete failed'));
        
        const user = userEvent.setup();
        renderComponent();
        
        await user.click(screen.getByRole('button', { name: /cancel appointment/i }));
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to cancel appointment', expect.any(Object));
        });
    });

    it('filters by year correctly and executes clear rules', async () => {
        const user = userEvent.setup();
        vi.mocked(API.get).mockResolvedValue({ data: { data: [] } }); 
        renderComponent();
        
        await waitFor(() => expect(API.get).toHaveBeenCalledWith('/appointments'));
        vi.mocked(API.get).mockClear();

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, '2026');

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/appointments?year=2026');
        });
        
        vi.mocked(API.get).mockClear();

        await user.click(screen.getByRole('button', { name: /clear filter/i }));

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/appointments');
        });
    });
});
