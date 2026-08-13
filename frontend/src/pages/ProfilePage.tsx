import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  username: z.string().min(3),
  school: z.string().min(2),
  bio: z.string().min(8),
  graduationYear: z.coerce.number().min(2020).max(2100)
});

const privacyItems: Array<{ key: 'showOnLeaderboard' | 'publicProfile' | 'studyReminders'; label: string }> = [
  { key: 'showOnLeaderboard', label: 'Show me on leaderboards' },
  { key: 'publicProfile', label: 'Allow classmates to view my profile' },
  { key: 'studyReminders', label: 'Send study reminders' }
];

type ProfileValues = z.infer<typeof schema>;

const ProfilePage = () => {
  const { user, updateProfile, settings, updateSettings } = useAuthStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        school: user.school ?? '',
        bio: user.bio ?? '',
        graduationYear: user.graduationYear ?? new Date().getFullYear()
      });
    }
  }, [reset, user]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <img src={user?.avatar ?? `https://ui-avatars.com/api/?name=${user?.username ?? 'Student'}&background=8b5cf6&color=ffffff`} alt={user?.username ?? 'profile'} className="h-20 w-20 rounded-full object-cover" />
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Profile</p>
            <h1 className="mt-2 text-3xl font-black text-white">{user?.username}</h1>
            <p className="mt-1 text-slate-300">{user?.school}</p>
          </div>
        </div>
        <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="section-title">Privacy controls</h2>
          {privacyItems.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-4 text-slate-200">
              <span>{label}</span>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-white/20 bg-transparent"
                checked={settings[key]}
                onChange={(event) => updateSettings({ [key]: event.target.checked })}
              />
            </label>
          ))}
        </div>
      </div>
      <form
        className="glass-card space-y-4 p-6"
        onSubmit={handleSubmit(async (values) => {
          await updateProfile(values);
        })}
      >
        <h2 className="section-title">Update profile</h2>
        <input className="field" placeholder="Username" {...register('username')} />
        {errors.username && <p className="text-sm text-rose-300">{errors.username.message}</p>}
        <input className="field" placeholder="School" {...register('school')} />
        {errors.school && <p className="text-sm text-rose-300">{errors.school.message}</p>}
        <textarea className="field min-h-[140px]" placeholder="Bio" {...register('bio')} />
        {errors.bio && <p className="text-sm text-rose-300">{errors.bio.message}</p>}
        <input className="field" type="number" placeholder="Graduation year" {...register('graduationYear')} />
        {errors.graduationYear && <p className="text-sm text-rose-300">{errors.graduationYear.message}</p>}
        <button className="btn-primary" type="submit">Save profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
