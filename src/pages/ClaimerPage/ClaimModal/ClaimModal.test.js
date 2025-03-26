import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ClaimModal from './ClaimModal';

// Mock setTimeout
jest.useFakeTimers();

describe('ClaimModal Component', () => {
    // Mock functions
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    // Function Tests

    // Test 1: Function - Should call onClose when clicking No button
    test('Calls onClose when No button is clicked', () => {
        render(
            <ClaimModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                actionType="Save"
            />
        );

        const noButton = screen.getByText('No');
        fireEvent.click(noButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    // Test 2: Function - Should call onConfirm after clicking Yes button and processing delay
    test('Calls onConfirm after clicking Yes button and processing delay', async () => {
        render(
            <ClaimModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                actionType="Submit"
            />
        );

        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);

        // Check processing state is shown
        expect(screen.getByText('Processing...')).toBeInTheDocument();

        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(1500);
        });

        // Check onConfirm is called after delay
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    // UI Tests

    // Test 3: UI - Should not render when isOpen is false
    test('Does not render when isOpen is false', () => {
        const { container } = render(
            <ClaimModal
                isOpen={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                actionType="Save"
            />
        );

        expect(container.firstChild).toBeNull();
    });

    // Test 4: UI - Should render correct message based on actionType
    test('Renders correct message based on actionType', () => {
        // Test with Save action type
        const { rerender } = render(
            <ClaimModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                actionType="Save"
            />
        );

        expect(screen.getByText(/save this claim/)).toBeInTheDocument();

        // Test with Submit action type
        rerender(
            <ClaimModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                actionType="Submit"
            />
        );

        expect(screen.getByText(/submit this claim/)).toBeInTheDocument();

        // Test with Cancel action type
        rerender(
            <ClaimModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                actionType="Cancel"
            />
        );

        expect(screen.getByText(/cancel this claim/)).toBeInTheDocument();
    });

    // Test 5: UI - Should disable buttons during processing
    test('Disables buttons during processing state', () => {
        render(
            <ClaimModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                actionType="Save"
            />
        );

        const yesButton = screen.getByText('Yes');
        const noButton = screen.getByText('No');

        // Initially buttons should be enabled
        expect(yesButton).not.toBeDisabled();
        expect(noButton).not.toBeDisabled();

        // Click Yes to start processing
        fireEvent.click(yesButton);

        // During processing, both buttons should be disabled
        const processingButton = screen.getByText('Processing...');
        expect(processingButton).toBeDisabled();
        expect(noButton).toBeDisabled();
    });
});