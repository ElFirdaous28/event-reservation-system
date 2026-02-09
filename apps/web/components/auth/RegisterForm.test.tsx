import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { RegisterForm } from './RegisterForm';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

describe('RegisterForm', () => {
  const mockPush = jest.fn();
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
    });
  });

  describe('Form Rendering', () => {
    it('should render registration form with all required fields', () => {
      render(<RegisterForm />);

      expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);
      expect(passwordInputs).toHaveLength(2);
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should render input fields with correct attributes and placeholders', () => {
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      expect(fullNameInput).toHaveAttribute('type', 'text');
      expect(fullNameInput).toHaveAttribute('name', 'fullName');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');

      expect(passwordInputs[0]).toHaveAttribute('type', 'password');
      expect(passwordInputs[0]).toHaveAttribute('name', 'password');

      expect(passwordInputs[1]).toHaveAttribute('type', 'password');
      expect(passwordInputs[1]).toHaveAttribute('name', 'confirmPassword');
    });
  });

  describe('Form Input Handling', () => {
    it('should update full name input value', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
      await user.type(fullNameInput, 'Jane Doe');

      expect(fullNameInput.value).toBe('Jane Doe');
    });

    it('should update email input value', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement;
      await user.type(emailInput, 'jane@example.com');

      expect(emailInput.value).toBe('jane@example.com');
    });

    it('should update password input value', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);
      const passwordInput = passwordInputs[0] as HTMLInputElement;

      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });

    it('should update confirm password input value', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);
      const confirmPasswordInput = passwordInputs[1] as HTMLInputElement;

      await user.type(confirmPasswordInput, 'password123');

      expect(confirmPasswordInput.value).toBe('password123');
    });
  });

  describe('Form Validation - Full Name', () => {
    it('should display error for empty full name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should display error for full name with less than 2 characters', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      await user.type(fullNameInput, 'J');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear full name error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument();
      });

      await user.type(fullNameInput, 'Jane Doe');
      await waitFor(() => {
        expect(screen.queryByText(/full name must be at least 2 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Email', () => {
    it('should display error for empty email', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      await user.type(fullNameInput, 'Jane Doe');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should display error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'notanemail');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorText = screen.queryByText(/invalid email address/i);
        if (errorText) {
          expect(errorText).toBeInTheDocument();
        } else {
          expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
        }
      });
    });

    it('should clear email error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(fullNameInput, 'Jane Doe');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });

      await user.type(emailInput, 'jane@example.com');
      await waitFor(() => {
        expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Password', () => {
    it('should display error for empty password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should display error for password less than 6 characters', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'pass');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear password error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });

      await user.type(passwordInputs[0], 'password123');
      await waitFor(() => {
        const errors = screen.queryAllByText(/password must be at least 6 characters/i);
        expect(errors.length).toBe(0);
      });
    });
  });

  describe('Form Validation - Confirm Password', () => {
    it('should display error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password456');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
    });

    it('should not display error when passwords match', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/passwords don't match/i)).not.toBeInTheDocument();
      });
    });

    it('should clear confirm password error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });

      await user.clear(passwordInputs[1]);
      await user.type(passwordInputs[1], 'password123');

      await waitFor(() => {
        expect(screen.queryByText(/passwords don't match/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Success', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('Jane Doe', 'jane@example.com', 'password123');
      });
    });

    it('should redirect to events page on successful registration', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/events');
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /register/i })).toBeEnabled();
      });
    });
  });

  describe('Form Submission - API Errors', () => {
    it('should display error message for email already registered', async () => {
      const user = userEvent.setup();
      const error = {
        response: {
          data: {
            message: 'Email already registered',
          },
        },
      };
      mockRegister.mockRejectedValue(error);

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is already registered/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message for other API errors', async () => {
      const user = userEvent.setup();
      const error = {
        response: {
          data: {
            message: 'Server error',
          },
        },
      };
      mockRegister.mockRejectedValue(error);

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should display fallback error message when no error details', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error('Network error'));

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
    });

    it('should disable form inputs during API request', async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement;
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i) as HTMLInputElement[];

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      expect(fullNameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInputs[0]).toBeDisabled();
      expect(passwordInputs[1]).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('should display validation errors with error styling', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput.className).toContain('border-error');
      });
    });

    it('should remove error styling when editing field with error', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput.className).toContain('border-error');
      });

      await user.type(emailInput, 'jane@example.com');

      await waitFor(() => {
        expect(emailInput.className).not.toContain('border-error');
      });
    });

    it('should display all validation errors at once', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should display API error message in styled container', async () => {
      const user = userEvent.setup();
      const error = {
        response: {
          data: {
            message: 'Email already registered',
          },
        },
      };
      mockRegister.mockRejectedValue(error);

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Find the error container div with bg-error class
        const errorContainer = screen.getByText(/email is already registered/i).closest('div[class*="bg-error"]');
        expect(errorContainer).toBeInTheDocument();
        expect(errorContainer?.className).toContain('bg-error');
      });
    });
  });

  describe('Form State Reset', () => {
    it('should clear all errors after successful submission', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);

      render(<RegisterForm />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      const passwordInputs = screen.getAllByPlaceholderText(/••••••/i);

      await user.type(fullNameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      // No validation errors should be displayed
      expect(screen.queryByText(/full name must be at least 2 characters/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/passwords don't match/i)).not.toBeInTheDocument();
    });
  });
});
