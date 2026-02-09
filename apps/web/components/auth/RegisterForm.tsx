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
    <form onSubmit={handleSubmit} className='space-y-4'>
      {apiError && <div className='bg-error rounded-lg p-4 text-white'>{apiError}</div>}

      <div>
        <label className='mb-1 block text-sm font-medium'>Full Name</label>
        <input
          type='text'
          name='fullName'
          value={formData.fullName}
          onChange={handleChange}
          className={`focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
            errors.fullName ? 'border-error' : 'border-border'
          }`}
          placeholder='John Doe'
          disabled={isLoading}
        />
        {errors.fullName && <p className='text-error mt-1 text-sm'>{errors.fullName}</p>}
      </div>

      <div>
        <label className='mb-1 block text-sm font-medium'>Email</label>
        <input
          type='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
          className={`focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
            errors.email ? 'border-error' : 'border-border'
          }`}
          placeholder='you@example.com'
          disabled={isLoading}
        />
        {errors.email && <p className='text-error mt-1 text-sm'>{errors.email}</p>}
      </div>

      <div>
        <label className='mb-1 block text-sm font-medium'>Password</label>
        <input
          type='password'
          name='password'
          value={formData.password}
          onChange={handleChange}
          className={`focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
            errors.password ? 'border-error' : 'border-border'
          }`}
          placeholder='••••••'
          disabled={isLoading}
        />
        {errors.password && <p className='text-error mt-1 text-sm'>{errors.password}</p>}
      </div>

      <div>
        <label className='mb-1 block text-sm font-medium'>Confirm Password</label>
        <input
          type='password'
          name='confirmPassword'
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
            errors.confirmPassword ? 'border-error' : 'border-border'
          }`}
          placeholder='••••••'
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className='text-error mt-1 text-sm'>{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='bg-primary hover:bg-primary-hover w-full rounded-lg py-2 font-medium text-white transition-colors disabled:opacity-50'
      >
        {isLoading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
