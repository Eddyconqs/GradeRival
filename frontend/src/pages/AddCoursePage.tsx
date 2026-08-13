import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useCourseStore } from '../store/courseStore';

const schema = z.object({
  name: z.string().min(2, 'Course name is required'),
  code: z.string().min(2, 'Course code is required'),
  instructor: z.string().optional(),
  credits: z.coerce.number().min(0.5).max(6),
  semester: z.string().min(2),
  year: z.coerce.number().min(2020).max(2100),
  targetGrade: z.string().min(1),
  color: z.string().min(4)
});

type AddCourseValues = z.infer<typeof schema>;

const AddCoursePage = () => {
  const navigate = useNavigate();
  const { createCourse } = useCourseStore();
  const { register, handleSubmit, formState: { errors } } = useForm<AddCourseValues>({
    resolver: zodResolver(schema),
    defaultValues: { credits: 1, semester: 'Fall', year: new Date().getFullYear(), targetGrade: 'A', color: '#8b5cf6' }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Add course</p>
        <h1 className="mt-2 text-3xl font-black text-white">Create a class space with goals and color coding.</h1>
      </div>
      <form
        className="glass-card grid gap-4 p-6 sm:grid-cols-2"
        onSubmit={handleSubmit(async (values) => {
          await createCourse(values);
          navigate('/courses');
        })}
      >
        <div className="sm:col-span-2">
          <input className="field" placeholder="Course name" {...register('name')} />
          {errors.name && <p className="mt-2 text-sm text-rose-300">{errors.name.message}</p>}
        </div>
        <div>
          <input className="field" placeholder="Course code" {...register('code')} />
          {errors.code && <p className="mt-2 text-sm text-rose-300">{errors.code.message}</p>}
        </div>
        <div>
          <input className="field" placeholder="Instructor" {...register('instructor')} />
        </div>
        <div>
          <input className="field" type="number" step="0.5" placeholder="Credits" {...register('credits')} />
        </div>
        <div>
          <input className="field" placeholder="Semester" {...register('semester')} />
        </div>
        <div>
          <input className="field" type="number" placeholder="Year" {...register('year')} />
        </div>
        <div>
          <input className="field" placeholder="Target grade" {...register('targetGrade')} />
        </div>
        <div>
          <input className="field" type="color" {...register('color')} />
        </div>
        <button className="btn-primary sm:col-span-2" type="submit">Save course</button>
      </form>
    </div>
  );
};

export default AddCoursePage;
