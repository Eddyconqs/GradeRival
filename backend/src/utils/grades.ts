import { Assignment } from '../types';

const safeNumber = (value: number | undefined) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

export const calculateCurrentGrade = (assignments: Assignment[]) => {
  const graded = assignments.filter((assignment) => typeof assignment.earnedPoints === 'number' && assignment.totalPoints > 0);

  if (!graded.length) {
    return 0;
  }

  const totalEarned = graded.reduce((sum, assignment) => sum + safeNumber(assignment.earnedPoints), 0);
  const totalPossible = graded.reduce((sum, assignment) => sum + safeNumber(assignment.totalPoints), 0);

  return totalPossible ? Number(((totalEarned / totalPossible) * 100).toFixed(2)) : 0;
};

export const calculateProjectedGrade = (assignments: Assignment[]) => {
  if (!assignments.length) {
    return 0;
  }

  const completed = assignments.filter((assignment) => typeof assignment.earnedPoints === 'number');
  const completionRate = completed.length / assignments.length;
  const baseGrade = calculateCurrentGrade(assignments);
  const projected = baseGrade * (0.8 + completionRate * 0.2);

  return Number(Math.min(100, projected).toFixed(2));
};

export const calculateCategoryBreakdown = (assignments: Assignment[]) => {
  const grouped = assignments.reduce<Record<string, Assignment[]>>((accumulator, assignment) => {
    accumulator[assignment.category] = accumulator[assignment.category] ?? [];
    accumulator[assignment.category].push(assignment);
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([category, categoryAssignments]) => ({
    category,
    grade: calculateCurrentGrade(categoryAssignments),
    assignments: categoryAssignments.length,
    weight: Number((categoryAssignments.reduce((sum, item) => sum + item.weight, 0) / Math.max(categoryAssignments.length, 1)).toFixed(2))
  }));
};

export const calculateNeededScore = (assignments: Assignment[], targetGrade: number, finalExamPoints: number) => {
  const totalEarned = assignments.reduce((sum, assignment) => sum + safeNumber(assignment.earnedPoints), 0);
  const totalPossible = assignments.reduce((sum, assignment) => sum + safeNumber(assignment.totalPoints), 0);
  const targetPoints = ((totalPossible + finalExamPoints) * targetGrade) / 100;
  const needed = targetPoints - totalEarned;
  return Number(Math.max(0, Math.min(finalExamPoints, needed)).toFixed(2));
};
