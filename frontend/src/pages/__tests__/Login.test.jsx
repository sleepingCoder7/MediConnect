import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../Login';
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

describe('Login Component', () => {
    const mockSetUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ setUser: mockSetUser });
    });

    const renderLogin = () => {
        return render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    };

    it('renders login form correctly', () => {
        renderLogin();
        
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
    });

    it('allows typing in email and password fields', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('toggles password visibility when eye icon is clicked', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput).toHaveAttribute('type', 'password');
        
        const toggleSpan = passwordInput.nextElementSibling;
        
        await user.click(toggleSpan);
        expect(passwordInput).toHaveAttribute('type', 'text');
        
        await user.click(toggleSpan);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('displays validation error if fields are empty on submit', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const submitBtn = screen.getByRole('button', { name: 'Login' });
        await user.click(submitBtn);
        
        expect(screen.getByText('All fields are required')).toBeInTheDocument();
        expect(API.post).not.toHaveBeenCalled();
    });

    it('handles successful API login correctly', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { user: { id: 1, name: 'John Doe' } } };
        vi.mocked(API.post).mockResolvedValueOnce(mockResponse);
        
        renderLogin();
        
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'securepass');
        
        await user.click(screen.getByRole('button', { name: 'Login' }));
        
        expect(API.post).toHaveBeenCalledWith('/auth/login', {
            email: 'john@example.com',
            password: 'securepass'
        });
        
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Login successful');
            expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user);
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles failed API login correctly', async () => {
        const user = userEvent.setup();
        const mockError = { response: { data: { message: 'Invalid credentials' } } };
        vi.mocked(API.post).mockRejectedValueOnce(mockError);
        
        renderLogin();
        
        await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpass');
        
        await user.click(screen.getByRole('button', { name: 'Login' }));
        
        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
            expect(mockSetUser).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('handles missing error message gracefully on failed login', async () => {
        const user = userEvent.setup();
        const mockError = { };
        vi.mocked(API.post).mockRejectedValueOnce(mockError);
        
        renderLogin();
        
        await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpass');
        
        await user.click(screen.getByRole('button', { name: 'Login' }));
        
        await waitFor(() => {
            expect(screen.getByText('Login failed')).toBeInTheDocument();
        });
    });

    it('disables login button and shows loading state when submitting', async () => {
        const user = userEvent.setup();
        let resolvePromise;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        vi.mocked(API.post).mockReturnValue(promise);
        
        renderLogin();
        
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        
        const submitBtn = screen.getByRole('button', { name: 'Login' });
        await user.click(submitBtn);
        
        expect(submitBtn).toBeDisabled();
        expect(submitBtn).toHaveTextContent('Logging in...');
        
        resolvePromise({ data: { user: { id: 1 } } });
        
        // Wait for the promise to resolve before verifying the text has changed back
        await waitFor(() => {
            expect(submitBtn).not.toBeDisabled();
            expect(submitBtn).toHaveTextContent('Login');
        });
    });

    it('handles successful Google login', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { user: { id: 2, name: 'Google User' } } };
        vi.mocked(API.post).mockResolvedValueOnce(mockResponse);
        
        renderLogin();
        
        const googleLoginBtn = screen.getByTestId('google-login-btn');
        await user.click(googleLoginBtn);
        
        await waitFor(() => {
            expect(toast.loading).toHaveBeenCalledWith('Logging in...', { id: 'login' });
            expect(API.post).toHaveBeenCalledWith('/auth/google', {
                token: 'mock-google-token'
            });
            expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user);
            expect(toast.success).toHaveBeenCalledWith('Login successful', { id: 'login' });
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles failed Google login', async () => {
        const user = userEvent.setup();
        const mockError = new Error('Google Login Failed');
        vi.mocked(API.post).mockRejectedValueOnce(mockError);
        
        renderLogin();
        
        const googleLoginBtn = screen.getByTestId('google-login-btn');
        await user.click(googleLoginBtn);
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Login failed', { id: 'login' });
            expect(mockSetUser).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
