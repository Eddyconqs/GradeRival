import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginValues = z.infer<typeof schema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated, clearError, continueWithDemo } = useAuthStore();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate((location.state as { from?: string } | null)?.from ?? '/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-md p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Welcome back</p>
        <h1 className="mt-3 text-3xl font-black text-white">Sign in to GradeRival</h1>
        <p className="mt-3 text-sm text-slate-300">Use the demo account instantly or connect your own backend API.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              await login(values);
            } catch {
              return;
            }
          })}
        >
          <div>
            <input className="field" placeholder="Email" {...register('email')} />
            {errors.email && <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p>}
          </div>
          <div>
            <input className="field" type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p className="mt-2 text-sm text-rose-300">{errors.password.message}</p>}
          </div>
          {error && <p className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{error}</p>}
          <button className="btn-primary w-full" disabled={isLoading} type="submit">
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => {
              const googleUrl = import.meta.env.VITE_GOOGLE_AUTH_URL as string | undefined;
              if (googleUrl) {
                window.location.href = googleUrl;
                return;
              }
              setValue('email', 'demo@graderival.app');
              setValue('password', '');
              continueWithDemo();
            }}
          >
            Sign in with Google
          </button>
          <p className="text-center text-xs text-slate-400">
            Redirects to your configured Google auth URL. Without one, it opens a local demo session.
          </p>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <Link to="/forgot-password" className="hover:text-white">Forgot password?</Link>
          <Link to="/register" className="hover:text-white">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
