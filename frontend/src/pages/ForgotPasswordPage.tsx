import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email')
});

type ForgotPasswordValues = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuthStore();
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema)
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-md p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Reset access</p>
        <h1 className="mt-3 text-3xl font-black text-white">Forgot your password?</h1>
        <p className="mt-3 text-sm text-slate-300">Enter your email and GradeRival will prepare a reset path.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            const nextMessage = await requestPasswordReset(values.email);
            setMessage(nextMessage);
          })}
        >
          <input className="field" placeholder="Email" {...register('email')} />
          {errors.email && <p className="text-sm text-rose-300">{errors.email.message}</p>}
          <button className="btn-primary w-full" type="submit">Send reset link</button>
        </form>
        {message && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        <p className="mt-6 text-sm text-slate-300">
          Remembered it? <Link to="/login" className="text-white hover:text-brand-200">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
