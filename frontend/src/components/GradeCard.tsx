interface GradeCardProps {
  label: string;
  value: string;
  helper: string;
}

const GradeCard = ({ label, value, helper }: GradeCardProps) => (
  <div className="glass-card p-5">
    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{label}</p>
    <p className="mt-3 text-4xl font-black text-white">{value}</p>
    <p className="mt-2 text-sm text-slate-300">{helper}</p>
  </div>
);

export default GradeCard;
