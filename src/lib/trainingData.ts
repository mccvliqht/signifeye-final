// src/lib/trainingData.ts

export interface TrainingExample {
  landmarks: number[];
  label: string;
  language: 'ASL' | 'FSL';
}

// Updated ALPHABET: Pure A-Z only
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const generateTrainingData = (language: 'ASL' | 'FSL'): TrainingExample[] => {
  const examples: TrainingExample[] = [];
  
  ALPHABET.forEach((letter, letterIdx) => {
    for (let i = 0; i < 100; i++) {
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

const generateLandmarksForLetter = (
  letter: string,
  letterIdx: number,
  language: 'ASL' | 'FSL',
  variation: number
): number[] => {
  const landmarks: number[] = [];
  const noise = () => (Math.random() - 0.5) * 0.015;
  
  landmarks.push(0, 0, 0); // Wrist
  
  const getLetterConfig = (letter: string) => {
    const configs: { [key: string]: { extended: number[], curled: number[], thumbOut?: boolean } } = {
      'A': { extended: [], curled: [1, 2, 3, 4], thumbOut: true },
      'B': { extended: [1, 2, 3, 4], curled: [0] },
      'C': { extended: [], curled: [], thumbOut: true },
      'D': { extended: [1], curled: [2, 3, 4, 0] },
      'E': { extended: [], curled: [1, 2, 3, 4] },
      'F': { extended: [2, 3, 4], curled: [], thumbOut: true },
      'G': { extended: [1], curled: [2, 3, 4] },
      'H': { extended: [1, 2], curled: [3, 4, 0] },
      'I': { extended: [4], curled: [1, 2, 3] },
      'J': { extended: [4], curled: [1, 2, 3] },
      'K': { extended: [1, 2], curled: [3, 4] },
      'L': { extended: [1], curled: [2, 3, 4], thumbOut: true },
      'M': { extended: [], curled: [1, 2, 3, 4] },
      'N': { extended: [], curled: [1, 2, 3, 4] },
      'O': { extended: [], curled: [], thumbOut: true },
      'P': { extended: [1], curled: [2, 3, 4] },
      'Q': { extended: [1], curled: [2, 3, 4], thumbOut: true },
      'R': { extended: [1, 2], curled: [3, 4, 0] },
      'S': { extended: [], curled: [1, 2, 3, 4] },
      'T': { extended: [], curled: [1, 2, 3, 4] },
      'U': { extended: [1, 2], curled: [3, 4, 0] },
      'V': { extended: [1, 2], curled: [3, 4, 0] },
      'W': { extended: [1, 2, 3], curled: [4, 0] },
      'X': { extended: [1], curled: [2, 3, 4, 0] },
      'Y': { extended: [0, 4], curled: [1, 2, 3] },
      'Z': { extended: [1], curled: [2, 3, 4, 0] },
    };
    return configs[letter] || { extended: [], curled: [1, 2, 3, 4] };
  };
  
  const config = getLetterConfig(letter);
  
  for (let i = 1; i <= 20; i++) {
    const fingerIdx = Math.floor((i - 1) / 4);
    const jointIdx = (i - 1) % 4;
    let x = 0, y = 0, z = 0;
    const isExtended = config.extended.includes(fingerIdx);
    const isCurled = config.curled.includes(fingerIdx);
    const fingerBaseX = fingerIdx * 0.025;
    
    if (isExtended) {
      x = fingerBaseX + noise();
      y = -0.05 - (jointIdx * 0.035) + noise();
      z = jointIdx * 0.005 + noise();
    } else if (isCurled) {
      x = fingerBaseX + (jointIdx * 0.015) + noise();
      y = -0.03 - (jointIdx * 0.015) + noise();
      z = -0.03 - (jointIdx * 0.015) + noise();
    } else {
      const curvature = jointIdx * 0.02;
      x = fingerBaseX + curvature + noise();
      y = -0.05 - (jointIdx * 0.025) + noise();
      z = -0.015 - curvature + noise();
    }
    
    if (fingerIdx === 0 && config.thumbOut) {
      x = -0.04 + (jointIdx * 0.02) + noise();
      y = -0.02 - (jointIdx * 0.015) + noise();
      z = 0.02 + (jointIdx * 0.01) + noise();
    }
    landmarks.push(x, y, z);
  }
  return landmarks;
};