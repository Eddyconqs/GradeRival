import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  school: z.string().min(2, 'Enter your school name')
});

type RegisterValues = z.infer<typeof schema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-xl p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Join GradeRival</p>
        <h1 className="mt-3 text-3xl font-black text-white">Build your academic command center</h1>
        <form
          className="mt-8 grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            await registerUser(values);
          })}
        >
          <div className="sm:col-span-2">
            <input className="field" placeholder="Full name" {...register('name')} />
            {errors.name && <p className="mt-2 text-sm text-rose-300">{errors.name.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <input className="field" placeholder="Email" {...register('email')} />
            {errors.email && <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p>}
          </div>
          <div>
            <input className="field" placeholder="Username" {...register('username')} />
            {errors.username && <p className="mt-2 text-sm text-rose-300">{errors.username.message}</p>}
          </div>
          <div>
            <input className="field" placeholder="School" {...register('school')} />
            {errors.school && <p className="mt-2 text-sm text-rose-300">{errors.school.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <input className="field" type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p className="mt-2 text-sm text-rose-300">{errors.password.message}</p>}
          </div>
          <button type="submit" className="btn-primary sm:col-span-2" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-300">
          Already have an account? <Link className="text-white hover:text-brand-200" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
