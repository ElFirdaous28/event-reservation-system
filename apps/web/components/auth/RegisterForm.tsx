'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { RegisterFormData, registerSchema } from '@/lib/validations/auth';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    // Validate with Zod
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const validationErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = String(err.path[0]);
        if (path) {
          validationErrors[path] = err.message;
        }
      });
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.fullName, formData.email, formData.password);
      router.push('/events');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage === 'Email already registered') {
        setApiError('This email is already registered. Please login instead.');
      } else {
        setApiError(errorMessage || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="p-4 bg-error text-white rounded-lg">
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.fullName ? 'border-error' : 'border-border'
          }`}
          placeholder="John Doe"
          disabled={isLoading}
        />
        {errors.fullName && <p className="text-error text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.email ? 'border-error' : 'border-border'
          }`}
          placeholder="you@example.com"
          disabled={isLoading}
        />
        {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.password ? 'border-error' : 'border-border'
          }`}
          placeholder="••••••"
          disabled={isLoading}
        />
        {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.confirmPassword ? 'border-error' : 'border-border'
          }`}
          placeholder="••••••"
          disabled={isLoading}
        />
        {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors font-medium"
      >
        {isLoading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
