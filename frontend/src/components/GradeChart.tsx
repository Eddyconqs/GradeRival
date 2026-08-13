import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const GradeChart = ({ data }: { data: Array<{ label: string; grade: number }> }) => (
  <div className="glass-card p-5">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="section-title">Grade Trend</h3>
      <p className="text-sm text-slate-400">Recent scored work</p>
    </div>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} />
          <Line type="monotone" dataKey="grade" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#60a5fa', r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default GradeChart;
