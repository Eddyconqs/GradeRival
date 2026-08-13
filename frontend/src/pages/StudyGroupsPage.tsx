import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createStudyGroupRequest, getStudyGroupsRequest, joinStudyGroupRequest } from '../api/studyGroups';
import StudyGroupCard from '../components/StudyGroupCard';
import { mockStudyGroups } from '../data/mockData';
import { StudyGroup } from '../types';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(6),
  code: z.string().min(4),
  maxMembers: z.coerce.number().min(2).max(50)
});

type GroupValues = z.infer<typeof schema>;

const StudyGroupsPage = () => {
  const [groups, setGroups] = useState<StudyGroup[]>(mockStudyGroups);
  const [notice, setNotice] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupValues>({
    resolver: zodResolver(schema),
    defaultValues: { maxMembers: 12 }
  });

  useEffect(() => {
    getStudyGroupsRequest().then(setGroups).catch(() => setGroups(mockStudyGroups));
  }, []);

  const joinGroup = async (code: string) => {
    try {
      const result = await joinStudyGroupRequest(code);
      setNotice(result.message);
      setGroups((current) => current.map((group) => (group.code === code ? { ...group, joined: true } : group)));
    } catch {
      setNotice('Joined in demo mode.');
      setGroups((current) => current.map((group) => (group.code === code ? { ...group, joined: true } : group)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Study groups</p>
        <h1 className="mt-2 text-3xl font-black text-white">Learn with people chasing the same wins.</h1>
      </div>
      {notice && <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          {groups.map((group) => <StudyGroupCard key={group.id} group={group} onJoin={joinGroup} />)}
        </div>
        <form
          className="glass-card space-y-4 p-6"
          onSubmit={handleSubmit(async (values) => {
            try {
              const group = await createStudyGroupRequest(values);
              setGroups((current) => [{ ...group, memberCount: 1, joined: true }, ...current]);
              setNotice('Study group created.');
            } catch {
              setGroups((current) => [{ id: `local-group-${Date.now()}`, createdAt: new Date().toISOString(), isPublic: true, ...values, memberCount: 1, joined: true }, ...current]);
              setNotice('Study group created in demo mode.');
            }
            reset();
          })}
        >
          <h2 className="section-title">Create a study group</h2>
          <input className="field" placeholder="Name" {...register('name')} />
          {errors.name && <p className="text-sm text-rose-300">{errors.name.message}</p>}
          <textarea className="field min-h-[120px]" placeholder="Description" {...register('description')} />
          {errors.description && <p className="text-sm text-rose-300">{errors.description.message}</p>}
          <input className="field" placeholder="Invite code" {...register('code')} />
          {errors.code && <p className="text-sm text-rose-300">{errors.code.message}</p>}
          <input className="field" type="number" placeholder="Max members" {...register('maxMembers')} />
          {errors.maxMembers && <p className="text-sm text-rose-300">{errors.maxMembers.message}</p>}
          <button className="btn-primary w-full" type="submit">Create group</button>
        </form>
      </div>
    </div>
  );
};

export default StudyGroupsPage;
