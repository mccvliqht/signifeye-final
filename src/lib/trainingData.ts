// src/lib/trainingData.ts

export interface TrainingExample {
  landmarks: number[];
  label: string;
  language: 'ASL' | 'FSL';
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// Ito yung mga phrases na meron tayo sa gestures
export const COMMON_PHRASES = [
  'Hello', 'I love you', 'Wait a Minute', 'Yes', 'No', 
  'Good', 'Water', 'Peace', 'Father', 'Mother', 
  'Fine', 'Call Me', 'Drink', 'You', 'I/Me', 
  'Think', 'Please', 'Sorry'
];

export const generateTrainingData = (language: 'ASL' | 'FSL'): TrainingExample[] => {
  const examples: TrainingExample[] = [];
  
  ALPHABET.forEach((letter, letterIdx) => {
    // Generate MORE samples (150) to make it smarter
    for (let i = 0; i < 150; i++) {
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
  // Increased noise slightly to simulate real shaky hands
  const noise = () => (Math.random() - 0.5) * 0.03; 
  
  landmarks.push(0, 0, 0); // Wrist at center

  // --- CONFIGURATION ---
  // Added 'orientation' to handle rotation
  type Config = { 
      extended: number[], 
      curled: number[], 
      orientation?: 'up' | 'down' | 'side', 
      thumbPos?: 'tucked' | 'side' | 'out' 
  };

  const getLetterConfig = (letter: string): Config => {
    const configs: { [key: string]: Config } = {
      'A': { extended: [], curled: [1, 2, 3, 4], thumbPos: 'side', orientation: 'up' },
      'B': { extended: [1, 2, 3, 4], curled: [0], thumbPos: 'tucked', orientation: 'up' },
      'C': { extended: [], curled: [], thumbPos: 'out', orientation: 'side' }, // C is curved
      
      // D points UP
      'D': { extended: [1], curled: [2, 3, 4, 0], orientation: 'up' },
      
      'E': { extended: [], curled: [1, 2, 3, 4], thumbPos: 'tucked', orientation: 'up' },
      'F': { extended: [2, 3, 4], curled: [1], thumbPos: 'side', orientation: 'up' },
      
      // G & H are SIDEWAYS
      'G': { extended: [1], curled: [2, 3, 4], orientation: 'side', thumbPos: 'side' },
      'H': { extended: [1, 2], curled: [3, 4], orientation: 'side', thumbPos: 'tucked' },
      
      'I': { extended: [4], curled: [1, 2, 3], orientation: 'up' },
      'J': { extended: [4], curled: [1, 2, 3], orientation: 'side' }, // J has motion usually, but static shape is side/down
      'K': { extended: [1, 2], curled: [3, 4], orientation: 'up' },
      'L': { extended: [1], curled: [2, 3, 4], thumbPos: 'out', orientation: 'up' },
      
      // M, N, T, S (The "Fist" group - Hard to distinguish without specific thumb math)
      // We rely on subtle noise differences here, but usually these need manual corrections
      'M': { extended: [], curled: [1, 2, 3, 4], thumbPos: 'tucked' }, 
      'N': { extended: [], curled: [1, 2, 3, 4], thumbPos: 'tucked' },
      'S': { extended: [], curled: [1, 2, 3, 4], thumbPos: 'tucked' },
      'T': { extended: [], curled: [1, 2, 3, 4], thumbPos: 'tucked' },

      'O': { extended: [], curled: [1, 2, 3, 4], thumbPos: 'tucked' },
      
      // P & Q are DOWNWARDS
      'P': { extended: [1], curled: [2, 3, 4], orientation: 'down', thumbPos: 'side' },
      'Q': { extended: [1], curled: [2, 3, 4], orientation: 'down', thumbPos: 'side' },
      
      'R': { extended: [1, 2], curled: [3, 4], thumbPos: 'tucked', orientation: 'up' },
      
      'U': { extended: [1, 2], curled: [3, 4], thumbPos: 'tucked', orientation: 'up' },
      'V': { extended: [1, 2], curled: [3, 4], thumbPos: 'tucked', orientation: 'up' },
      'W': { extended: [1, 2, 3], curled: [4], thumbPos: 'tucked', orientation: 'up' },
      
      // X is a Hook
      'X': { extended: [], curled: [1, 2, 3, 4], orientation: 'up', thumbPos: 'tucked' }, // X is technically a curled index
      
      'Y': { extended: [0, 4], curled: [1, 2, 3], thumbPos: 'out', orientation: 'up' },
      'Z': { extended: [1], curled: [2, 3, 4], orientation: 'up' },
    };
    return configs[letter] || { extended: [], curled: [1, 2, 3, 4], orientation: 'up' };
  };
  
  const config = getLetterConfig(letter);
  
  // Generate fingers
  for (let i = 1; i <= 20; i++) {
    const fingerIdx = Math.floor((i - 1) / 4);
    const jointIdx = (i - 1) % 4;
    
    let x = 0, y = 0, z = 0;
    
    const isExtended = config.extended.includes(fingerIdx);
    const fingerBaseX = (fingerIdx - 2) * 0.04; // Spread fingers out a bit more centered relative to wrist
    
    // 1. BASE SHAPE (Before Rotation) - Assuming UP orientation
    if (isExtended) {
        x = fingerBaseX + noise();
        y = -0.06 - (jointIdx * 0.03) + noise(); // Long fingers up
        z = jointIdx * 0.005 + noise();
    } else {
        // Curled
        x = fingerBaseX + (jointIdx * 0.01) + noise();
        y = -0.02 - (jointIdx * 0.01) + noise(); // Short curled near palm
        z = -0.03 - (jointIdx * 0.015) + noise();
    }

    // Thumb Override
    if (fingerIdx === 0) {
        if (config.thumbPos === 'out') {
             x = -0.06 - (jointIdx * 0.02);
             y = -0.03 - (jointIdx * 0.01);
        } else if (config.thumbPos === 'side') {
             x = -0.03;
             y = -0.04;
        }
    }

    // 2. APPLY ROTATION (Fixes G, H, P, Q)
    let finalX = x;
    let finalY = y;
    
    if (config.orientation === 'down') {
        // Invert Y (Point down) - Fixes P, Q
        finalY = -y + 0.05; 
        finalX = x; // Slight offset
    } else if (config.orientation === 'side') {
        // Swap X and Y (Point Right/Left) - Fixes G, H
        finalX = y; 
        finalY = x;
    }

    landmarks.push(finalX + noise(), finalY + noise(), z);
  }
  
  return landmarks;
};