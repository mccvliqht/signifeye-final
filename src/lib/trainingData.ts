// Synthetic training data generator for ASL/FSL alphabet
// Based on typical hand landmark patterns for static letters A-Z

export interface TrainingExample {
  landmarks: number[]; // 63 features (21 landmarks × x,y,z)
  label: string;
  language: 'ASL' | 'FSL';
}

// Generate synthetic landmark data based on known ASL/FSL patterns
export const generateTrainingData = (language: 'ASL' | 'FSL'): TrainingExample[] => {
  const examples: TrainingExample[] = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Generate 50 examples per letter with variations
  alphabet.forEach((letter, letterIdx) => {
    for (let i = 0; i < 50; i++) {
      const landmarks = generateLandmarksForLetter(letter, letterIdx, language, i);
      examples.push({
        landmarks,
        label: letter,
        language
      });
    }
  });
  
  return examples;
};

// Generate realistic hand landmarks for a specific letter
const generateLandmarksForLetter = (
  letter: string,
  letterIdx: number,
  language: 'ASL' | 'FSL',
  variation: number
): number[] => {
  const landmarks: number[] = [];
  const noise = () => (Math.random() - 0.5) * 0.02; // Small random variation
  
  // Base patterns for different letter types
  const isFist = ['A', 'E', 'M', 'N', 'S', 'T'].includes(letter);
  const isPointing = ['D', 'I', 'J', 'Z'].includes(letter);
  const isOpen = ['B', 'C', 'O'].includes(letter);
  const isV = ['K', 'R', 'U', 'V', 'W'].includes(letter);
  
  // Wrist at origin
  landmarks.push(0, 0, 0);
  
  // Generate 20 more landmarks based on letter pattern
  for (let i = 1; i <= 20; i++) {
    const fingerIdx = Math.floor((i - 1) / 4); // 0-4 for thumb to pinky
    const jointIdx = (i - 1) % 4; // 0-3 for each joint
    
    let x = 0, y = 0, z = 0;
    
    if (isFist) {
      // Curled fingers
      x = 0.05 + fingerIdx * 0.02 + noise();
      y = -0.05 - jointIdx * 0.02 + noise();
      z = -0.02 - jointIdx * 0.01 + noise();
    } else if (isPointing) {
      // Index finger extended, others curled
      if (fingerIdx === 1) {
        x = 0.05 + noise();
        y = -0.1 - jointIdx * 0.03 + noise();
        z = noise();
      } else {
        x = 0.05 + fingerIdx * 0.02 + noise();
        y = -0.05 - jointIdx * 0.02 + noise();
        z = -0.02 - jointIdx * 0.01 + noise();
      }
    } else if (isOpen) {
      // All fingers extended
      x = 0.05 + fingerIdx * 0.025 + noise();
      y = -0.08 - jointIdx * 0.03 + noise();
      z = noise();
    } else if (isV) {
      // Two fingers extended
      if (fingerIdx === 1 || fingerIdx === 2) {
        x = 0.05 + fingerIdx * 0.03 + noise();
        y = -0.1 - jointIdx * 0.03 + noise();
        z = noise();
      } else {
        x = 0.05 + fingerIdx * 0.02 + noise();
        y = -0.05 - jointIdx * 0.02 + noise();
        z = -0.02 - jointIdx * 0.01 + noise();
      }
    } else {
      // Default pattern with letter-specific offset
      const offset = letterIdx * 0.002;
      x = 0.05 + fingerIdx * 0.02 + offset + noise();
      y = -0.08 - jointIdx * 0.025 + offset + noise();
      z = offset + noise();
    }
    
    landmarks.push(x, y, z);
  }
  
  return landmarks;
};

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
