import { Assignment, Course } from '../types';

interface GuideParams {
  course: Course;
  assignments: Assignment[];
  topic?: string;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const buildFallbackGuide = ({ course, assignments, topic }: GuideParams) => {
  const upcoming = assignments
    .filter((assignment) => assignment.dueDate)
    .sort((a, b) => new Date(a.dueDate ?? '').getTime() - new Date(b.dueDate ?? '').getTime())
    .slice(0, 3);

  return `# ${course.name} Study Guide\n\n## Focus Topic\n${topic || `Core concepts for ${course.code}`}\n\n## Priority Concepts\n- Review lecture objectives and instructor notes for ${course.name}.\n- Rework recent assignments to identify patterns in mistakes.\n- Practice one timed problem set for each major category.\n\n## Assignment-Based Review\n${assignments
    .slice(0, 5)
    .map(
      (assignment) => `- **${assignment.name}** (${assignment.category}) — revisit the rubric and explain the solution path out loud.`
    )
    .join('\n')}\n\n## 3-Day Plan\n1. Day 1: Summarize each topic into a one-page cheat sheet.\n2. Day 2: Complete practice questions and self-grade them.\n3. Day 3: Review weak spots, then do a mock assessment.\n\n## Upcoming Deadlines\n${upcoming.length ? upcoming.map((item) => `- ${item.name}: ${new Date(item.dueDate ?? '').toLocaleDateString()}`).join('\n') : '- No upcoming deadlines recorded.'}\n`;
};

export const generateStudyGuide = async (params: GuideParams) => {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackGuide(params);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ['Bearer', process.env.OPENAI_API_KEY].join(' ')
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You create concise but actionable study guides for high-school and college students.'
        },
        {
          role: 'user',
          content: `Create a markdown study guide for ${params.course.name} (${params.course.code}). Topic: ${params.topic || 'General course review'}. Assignments: ${params.assignments
            .map((assignment) => `${assignment.name} [${assignment.category}]`) 
            .join(', ')}.`
        }
      ]
    })
  });

  if (!response.ok) {
    return buildFallbackGuide(params);
  }

  const data = (await response.json()) as OpenAIResponse;
  const text = data.choices?.[0]?.message?.content;
  return text?.trim() || buildFallbackGuide(params);
};
