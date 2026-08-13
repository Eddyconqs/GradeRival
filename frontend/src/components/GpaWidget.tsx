const GpaWidget = ({ gpa, helper }: { gpa: number; helper: string }) => (
  <div className="glass-card bg-gradient-to-br from-brand-500/20 to-blue-500/20 p-6">
    <p className="text-sm uppercase tracking-[0.24em] text-brand-200">Current GPA</p>
    <div className="mt-4 flex items-end gap-3">
      <span className="text-5xl font-black text-white">{gpa.toFixed(2)}</span>
      <span className="mb-1 text-slate-300">/ 4.00</span>
    </div>
    <p className="mt-3 text-sm text-slate-200">{helper}</p>
  </div>
);

export default GpaWidget;
