import { Assignment, Course, CourseStats } from '../types';

export const calculateCurrentGrade = (assignments: Assignment[]) => {
  const graded = assignments.filter((assignment) => typeof assignment.earnedPoints === 'number' && assignment.totalPoints > 0);
  if (!graded.length) return 0;
  const earned = graded.reduce((sum, assignment) => sum + (assignment.earnedPoints ?? 0), 0);
  const possible = graded.reduce((sum, assignment) => sum + assignment.totalPoints, 0);
  return Number(((earned / possible) * 100).toFixed(2));
};

export const calculateProjectedGrade = (assignments: Assignment[]) => {
  if (!assignments.length) return 0;
  const current = calculateCurrentGrade(assignments);
  const completedRatio = assignments.filter((assignment) => assignment.submitted).length / assignments.length;
  return Number(Math.min(100, current * (0.85 + completedRatio * 0.15)).toFixed(2));
};

export const calculateNeededScore = (assignments: Assignment[], targetGrade: number, finalExamPoints: number) => {
  const earned = assignments.reduce((sum, assignment) => sum + (assignment.earnedPoints ?? 0), 0);
  const possible = assignments.reduce((sum, assignment) => sum + assignment.totalPoints, 0);
  const needed = ((possible + finalExamPoints) * targetGrade) / 100 - earned;
  return Number(Math.min(finalExamPoints, Math.max(0, needed)).toFixed(2));
};

export const summarizeCourses = (courses: Course[], assignmentMap: Record<string, Assignment[]>) =>
  courses.map((course) => {
    const assignments = assignmentMap[course.id] ?? [];
    return {
      ...course,
      currentGrade: calculateCurrentGrade(assignments),
      projectedGrade: calculateProjectedGrade(assignments),
      assignmentsCount: assignments.length
    };
  });

export const buildCourseStats = (assignments: Assignment[]): CourseStats => {
  const categoryMap = assignments.reduce<Record<string, Assignment[]>>((accumulator, assignment) => {
    accumulator[assignment.category] = accumulator[assignment.category] ?? [];
    accumulator[assignment.category].push(assignment);
    return accumulator;
  }, {});

  return {
    currentGrade: calculateCurrentGrade(assignments),
    projectedGrade: calculateProjectedGrade(assignments),
    neededForA: calculateNeededScore(assignments, 90, 100),
    completedAssignments: assignments.filter((assignment) => assignment.submitted).length,
    totalAssignments: assignments.length,
    categoryBreakdown: Object.entries(categoryMap).map(([category, items]) => ({
      category,
      grade: calculateCurrentGrade(items),
      assignments: items.length,
      weight: Number((items.reduce((sum, item) => sum + item.weight, 0) / Math.max(items.length, 1)).toFixed(2))
    })),
    trend: assignments
      .filter((assignment) => typeof assignment.earnedPoints === 'number')
      .map((assignment) => ({
        label: assignment.name,
        grade: Number((((assignment.earnedPoints ?? 0) / assignment.totalPoints) * 100).toFixed(2))
      }))
  };
};
