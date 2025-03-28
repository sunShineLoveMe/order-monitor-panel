export interface ThinkingStep {
  id: number;
  type: 'observation' | 'analysis' | 'insight' | 'conclusion';
  content: string;
} 