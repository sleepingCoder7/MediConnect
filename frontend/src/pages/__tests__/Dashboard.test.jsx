import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../Dashboard';
import { MemoryRouter, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

// Mock react-router
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useLocation: vi.fn(),
    };
});

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock Sidebar component
vi.mock('../../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar Mock</div>,
}));

// Mock axios instance
vi.mock('../../api/axios', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
    }
}));

// Mock react-hot-toast (it is exported as an object from the package in this implementation)
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
    }
}));

describe('Dashboard Component', () => {
    const mockSetUser = vi.fn();
    const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        profile: {
            firstName: 'John',
            lastName: 'Doe',
            gender: 'Male',
            dateOfBirth: '1990-01-01T00:00:00.000Z',
            phone: '1234567890',
        },
        address: {
            line1: '123 Main St',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zipcode: '100001',
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, setUser: mockSetUser });
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard' });
    });

    const renderDashboard = () => {
        return render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
    };

    it('renders the welcome screen by default when not on profile path', () => {
        renderDashboard();
        
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByText('Welcome to MediConnect')).toBeInTheDocument();
        expect(screen.queryByText('Patient Details')).not.toBeInTheDocument();
    });

    it('renders the profile form when path is /dashboard/profile', () => {
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        renderDashboard();
        
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByText('Patient Details')).toBeInTheDocument();
        expect(screen.getByText(/Welcome back, John/)).toBeInTheDocument();
    });

    it('populates form fields correctly from user context', () => {
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        renderDashboard();
        
        expect(screen.getByLabelText('First Name')).toHaveValue('John');
        expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
        expect(screen.getByLabelText('Gender')).toHaveValue('Male');
        // HTML date format is YYYY-MM-DD
        expect(screen.getByLabelText('Date of Birth')).toHaveValue('1990-01-01');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Phone')).toHaveValue('1234567890');
        expect(screen.getByLabelText('Address Line 1')).toHaveValue('123 Main St');
        expect(screen.getByLabelText('Address Line 2')).toHaveValue('Apt 4B');
        expect(screen.getByLabelText('City')).toHaveValue('New York');
        expect(screen.getByLabelText('State')).toHaveValue('NY');
        expect(screen.getByLabelText('ZipCode')).toHaveValue('100001');
    });

    it('validates phone number correctly on change', async () => {
        const user = userEvent.setup();
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        renderDashboard();
        
        const phoneInput = screen.getByLabelText('Phone');
        
        await user.clear(phoneInput);
        await user.type(phoneInput, 'invalid');
        expect(screen.getByText('Phone number must contain only numbers')).toBeInTheDocument();

        await user.clear(phoneInput);
        await user.type(phoneInput, '12345');
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument();

        await user.clear(phoneInput);
        await user.type(phoneInput, '1234567890');
        expect(screen.queryByText(/Phone number must contain only numbers|Phone number must be at least 10 digits/)).not.toBeInTheDocument();
    });

    it('validates zipcode correctly on change', async () => {
        const user = userEvent.setup();
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        renderDashboard();
        
        const zipcodeInput = screen.getByLabelText('ZipCode');
        
        await user.clear(zipcodeInput);
        await user.type(zipcodeInput, 'abcd');
        expect(screen.getByText('Zipcode must contain only numbers')).toBeInTheDocument();

        await user.clear(zipcodeInput);
        await user.type(zipcodeInput, '12345');
        expect(screen.getByText('Zipcode must be at least 6 digits')).toBeInTheDocument();

        await user.clear(zipcodeInput);
        await user.type(zipcodeInput, '123456');
        expect(screen.queryByText(/Zipcode must contain only numbers|Zipcode must be at least 6 digits/)).not.toBeInTheDocument();
    });

    it('prevents saving and shows toast if there are validation errors', async () => {
        const user = userEvent.setup();
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        renderDashboard();
        
        const phoneInput = screen.getByLabelText('Phone');
        await user.clear(phoneInput);
        await user.type(phoneInput, '123'); // Triggers invalid phone error
        
        const saveBtn = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveBtn);
        
        expect(API.put).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Please fix the errors before saving', expect.any(Object));
    });

    it('successfully updates user profile context via API call', async () => {
        const user = userEvent.setup();
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        
        const mockUpdatedResponse = { 
            data: { 
                user: { 
                    ...mockUser, 
                    profile: { ...mockUser.profile, firstName: 'Jane' } 
                } 
            } 
        };
        vi.mocked(API.put).mockResolvedValueOnce(mockUpdatedResponse);
        
        renderDashboard();
        
        const firstNameInput = screen.getByLabelText('First Name');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Jane');
        
        const saveBtn = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveBtn);

        expect(toast.loading).toHaveBeenCalledWith('Updating profile...', expect.any(Object));
        
        expect(API.put).toHaveBeenCalledWith('/user/update', expect.objectContaining({
            firstName: 'Jane', // Specifically asserting the updated one
            lastName: 'Doe',
            phone: '1234567890'
        }));
        
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Profile updated successfully', expect.any(Object));
            expect(mockSetUser).toHaveBeenCalledWith(mockUpdatedResponse.data.user);
        });
    });

    it('handles failed profile updates and throws error toast', async () => {
        const user = userEvent.setup();
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        vi.mocked(API.put).mockRejectedValueOnce(new Error('Update failed'));
        renderDashboard();
        
        const saveBtn = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveBtn);
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to update profile', expect.any(Object));
        });
    });

    it('reverts changes correctly back to previous context user state', async () => {
        const user = userEvent.setup();
        vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard/profile' });
        renderDashboard();
        
        const firstNameInput = screen.getByLabelText('First Name');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Jane');
        
        expect(firstNameInput).toHaveValue('Jane');
        
        const revertBtn = screen.getByRole('button', { name: /revert changes/i });
        await user.click(revertBtn);
        
        expect(firstNameInput).toHaveValue('John'); 
        expect(toast.success).toHaveBeenCalledWith('Changes reverted', expect.any(Object));
    });
});
