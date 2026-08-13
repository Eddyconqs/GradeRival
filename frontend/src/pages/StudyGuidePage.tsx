import { useEffect, useMemo, useState } from 'react';
import { generateStudyGuideRequest } from '../api/ai';
import { useCourseStore } from '../store/courseStore';
import { StudyGuide } from '../types';

const StudyGuidePage = () => {
  const { courses, loadCourses } = useCourseStore();
  const [courseId, setCourseId] = useState('');
  const [topic, setTopic] = useState('Midterm review');
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (!courseId && courses[0]) setCourseId(courses[0].id);
  }, [courseId, courses]);

  const selectedCourse = useMemo(() => courses.find((course) => course.id === courseId) ?? courses[0], [courseId, courses]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">AI study guide</p>
        <h1 className="mt-2 text-3xl font-black text-white">Generate a focused study plan from your course history.</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Course</span>
              <select className="field" value={selectedCourse?.id ?? ''} onChange={(event) => setCourseId(event.target.value)}>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Topic focus</span>
              <input className="field" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Midterm review" />
            </label>
            <button
              className="btn-primary w-full"
              onClick={async () => {
                if (!selectedCourse) return;
                setLoading(true);
                try {
                  const generated = await generateStudyGuideRequest(selectedCourse.id, topic);
                  setGuide(generated);
                } catch {
                  setGuide({
                    id: `local-guide-${Date.now()}`,
                    userId: 'user-demo',
                    courseId: selectedCourse.id,
                    createdAt: new Date().toISOString(),
                    content: `# ${selectedCourse.name} Study Guide\n\n## Topic\n${topic}\n\n## Focus Areas\n- Revisit the hardest recent assignments.\n- Build a formula sheet and concept map.\n- Practice under timed conditions.\n\n## Quick Win Plan\n1. Review notes for 25 minutes.\n2. Complete 5 practice problems.\n3. Teach the concept back in your own words.`
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? 'Generating guide…' : 'Generate study guide'}
            </button>
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="section-title">Generated guide</h2>
          {guide ? (
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">{guide.content}</pre>
          ) : (
            <p className="mt-4 text-slate-300">Choose a course and topic to generate a tailored study guide. If your OpenAI key is configured on the backend, GradeRival will call the API; otherwise, it falls back to a structured local guide.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGuidePage;
