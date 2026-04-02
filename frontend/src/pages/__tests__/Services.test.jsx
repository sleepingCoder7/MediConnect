import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Services from '../Services';
import API from '../../api/axios';

// Mock axios instance
vi.mock('../../api/axios', () => ({
    default: {
        get: vi.fn(),
    }
}));

// Mock ServiceCard component so we can isolate Services component testing
vi.mock('../../components/ServiceCard', () => ({
    default: ({ title, description }) => (
        <div data-testid="service-card">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    ),
}));

describe('Services Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('renders the main heading', async () => {
        vi.mocked(API.get).mockResolvedValueOnce({ data: [] });
        render(<Services />);
        
        expect(screen.getByRole('heading', { level: 1, name: /services/i })).toBeInTheDocument();
        
        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/services');
        });
    });

    it('displays loading spinner while fetching data', async () => {
        let resolvePromise;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        vi.mocked(API.get).mockReturnValue(promise);
        
        const { container } = render(<Services />);
        
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();

        resolvePromise({ data: [] });
        
        await waitFor(() => {
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
        });
    });

    it('renders a list of services after successful fetch', async () => {
        const mockServices = [
            { _id: '1', name: 'General Checkup', description: 'Basic physical health checkup' },
            { _id: '2', name: 'Dental Care', description: 'Teeth cleaning and oral care' },
        ];
        
        vi.mocked(API.get).mockResolvedValue({ data: { services: mockServices } });
        
        render(<Services />);
        
        await waitFor(() => {
            const cards = screen.getAllByTestId('service-card');
            expect(cards).toHaveLength(2);
        });

        expect(screen.getByRole('heading', { name: 'General Checkup' })).toBeInTheDocument();
        expect(screen.getByText('Basic physical health checkup')).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Dental Care' })).toBeInTheDocument();
        expect(screen.getByText('Teeth cleaning and oral care')).toBeInTheDocument();
    });

    it('handles API errors gracefully and removes loading state', async () => {
        const mockError = new Error('Network Error');
        vi.mocked(API.get).mockRejectedValueOnce(mockError);
        
        const { container } = render(<Services />);
        
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();

        await waitFor(() => {
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
        });
        
        expect(console.error).toHaveBeenCalledWith('Error fetching services:', mockError);
        
        expect(screen.queryByTestId('service-card')).not.toBeInTheDocument();
    });
});
