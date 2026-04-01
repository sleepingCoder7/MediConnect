import React from 'react';
import { render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from '../Register';
import { MemoryRouter } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock axios instance
vi.mock('../../api/axios', () => ({
    default: {
        post: vi.fn(),
    }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
    }
}));

// Mock Google Login
vi.mock('@react-oauth/google', () => ({
    GoogleLogin: vi.fn(({ onSuccess, onError }) => (
        <button 
            data-testid="google-login-btn" 
            onClick={() => onSuccess({ credential: 'mock-google-token' })}
            onError={() => onError()}
        >
            Google Login
        </button>
    )),
}));

describe('Register Component', () => {
    const mockSetUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ setUser: mockSetUser });
    });

    const renderRegister = () => {
        return render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
    };

    it('renders register form correctly', () => {
        renderRegister();
        
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        // Use exact match or start/end anchor for Password to avoid matching Confirm Password
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument(); 
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
        expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
    });

    it('allows typing in all fields', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        
        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'password123');
        
        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('password123');
        expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('toggles password visibility when eye icons are clicked', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
        
        const passwordToggleSpan = passwordInput.nextElementSibling;
        const confirmPasswordToggleSpan = confirmPasswordInput.nextElementSibling;
        
        // Toggle Password
        await user.click(passwordToggleSpan);
        expect(passwordInput).toHaveAttribute('type', 'text');
        await user.click(passwordToggleSpan);
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Toggle Confirm Password
        await user.click(confirmPasswordToggleSpan);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
        await user.click(confirmPasswordToggleSpan);
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('displays validation error if passwords do not match', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/^Password$/i), 'password123');
        await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword');
        
        const submitBtn = screen.getByRole('button', { name: 'Register' });
        await user.click(submitBtn);
        
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        expect(API.post).not.toHaveBeenCalled();
    });

    it('handles successful registration API call correctly', async () => {
        const user = userEvent.setup();
        
        // Mock successful API response
        vi.mocked(API.post).mockResolvedValueOnce({});
        
        renderRegister();
        
        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/^Password$/i), 'securepass');
        await user.type(screen.getByLabelText(/confirm password/i), 'securepass');
        
        await user.click(screen.getByRole('button', { name: 'Register' }));
        
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
        
        expect(API.post).toHaveBeenCalledWith('/auth/register', {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'securepass'
        });
        
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Registration successful');
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('handles failed registration API call correctly', async () => {
        const user = userEvent.setup();
        const mockError = { response: { data: { message: 'Email already exists' } } };
        vi.mocked(API.post).mockRejectedValueOnce(mockError);
        
        renderRegister();
        
        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/^Password$/i), 'securepass');
        await user.type(screen.getByLabelText(/confirm password/i), 'securepass');
        
        await user.click(screen.getByRole('button', { name: 'Register' }));
        
        await waitFor(() => {
            expect(screen.getByText('Email already exists')).toBeInTheDocument();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('handles missing error message gracefully on failed registration', async () => {
        const user = userEvent.setup();
        const mockError = {};
        vi.mocked(API.post).mockRejectedValueOnce(mockError);
        
        renderRegister();
        
        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/^Password$/i), 'securepass');
        await user.type(screen.getByLabelText(/confirm password/i), 'securepass');
        
        await user.click(screen.getByRole('button', { name: 'Register' }));
        
        await waitFor(() => {
            expect(screen.getByText('Registration failed')).toBeInTheDocument();
        });
    });

    it('disables register button and shows loading state when submitting', async () => {
        const user = userEvent.setup();
        let resolvePromise;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        vi.mocked(API.post).mockReturnValue(promise);
        
        renderRegister();
        
        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/^Password$/i), 'securepass');
        await user.type(screen.getByLabelText(/confirm password/i), 'securepass');
        
        const submitBtn = screen.getByRole('button', { name: 'Register' });
        await user.click(submitBtn);
        
        expect(submitBtn).toBeDisabled();
        expect(submitBtn).toHaveTextContent('Registering...');
        
        resolvePromise({});
        
        await waitFor(() => {
            expect(submitBtn).not.toBeDisabled();
            expect(submitBtn).toHaveTextContent('Register');
        });
    });

    it('handles successful Google registration', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { user: { id: 2, name: 'Google User' } } };
        vi.mocked(API.post).mockResolvedValueOnce(mockResponse);
        
        renderRegister();
        
        const googleLoginBtn = screen.getByTestId('google-login-btn');
        await user.click(googleLoginBtn);
        
        await waitFor(() => {
            expect(toast.loading).toHaveBeenCalledWith('Signing up...', { id: 'register' });
            expect(API.post).toHaveBeenCalledWith('/auth/google', {
                token: 'mock-google-token'
            });
            expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user);
            expect(toast.success).toHaveBeenCalledWith('Registration successful', { id: 'register' });
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles failed Google registration', async () => {
        const user = userEvent.setup();
        const mockError = new Error('Google Registration Failed');
        vi.mocked(API.post).mockRejectedValueOnce(mockError);
        
        renderRegister();
        
        const googleLoginBtn = screen.getByTestId('google-login-btn');
        await user.click(googleLoginBtn);
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Registration failed', { id: 'register' });
            expect(mockSetUser).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
