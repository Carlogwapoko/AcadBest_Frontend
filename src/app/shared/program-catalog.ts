export const ENROLLMENT_PROGRAMS = [
  'BSTM',
  'BSED',
  'BEED',
  'BSE',
  'BSMA',
  'BSHM',
  'BSIT',
  'BSBA',
  'STEM',
  'ABM',
  'HUMSS',
  'GAS',
  'TVL',
] as const;

export const PROGRAM_MAJORS: Readonly<Record<string, readonly string[]>> = {
  BSBA: ['Financial Management', 'Human Resources Management'],
  BSED: ['Filipino', 'English', 'Mathematics'],
  TVL: [
    'ICT – Computer Servicing',
    'Home Economics',
    'Automotive Servicing',
    'Electricity Servicing',
  ],
};

export function majorsForProgram(program: string): string[] {
  return [...(PROGRAM_MAJORS[program] ?? [])];
}
