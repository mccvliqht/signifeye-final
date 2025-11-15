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
  
  // Generate 100 examples per letter with more variations for better accuracy
  alphabet.forEach((letter, letterIdx) => {
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

// Generate realistic hand landmarks based on actual ASL/FSL letter formations
const generateLandmarksForLetter = (
  letter: string,
  letterIdx: number,
  language: 'ASL' | 'FSL',
  variation: number
): number[] => {
  const landmarks: number[] = [];
  const noise = () => (Math.random() - 0.5) * 0.015; // Smaller variation for consistency
  
  // Wrist at origin (landmark 0)
  landmarks.push(0, 0, 0);
  
  // Realistic hand configurations for each letter
  // Finger indices: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
  // Joint indices: 0=CMC/MCP, 1=PIP, 2=DIP, 3=tip
  
  const getLetterConfig = (letter: string) => {
    const configs: { [key: string]: { extended: number[], curled: number[], thumbOut?: boolean } } = {
      'A': { extended: [], curled: [1, 2, 3, 4], thumbOut: true }, // Fist with thumb out
      'B': { extended: [1, 2, 3, 4], curled: [0] }, // Flat hand, thumb tucked
      'C': { extended: [], curled: [], thumbOut: true }, // Curved hand
      'D': { extended: [1], curled: [2, 3, 4, 0] }, // Index up, thumb to middle
      'E': { extended: [], curled: [1, 2, 3, 4] }, // Tight fist
      'F': { extended: [2, 3, 4], curled: [], thumbOut: true }, // OK sign
      'G': { extended: [1], curled: [2, 3, 4] }, // Index pointing sideways
      'H': { extended: [1, 2], curled: [3, 4, 0] }, // Index and middle sideways
      'I': { extended: [4], curled: [1, 2, 3] }, // Pinky up
      'J': { extended: [4], curled: [1, 2, 3] }, // Pinky up (motion)
      'K': { extended: [1, 2], curled: [3, 4] }, // Index and middle up, V-split
      'L': { extended: [1], curled: [2, 3, 4], thumbOut: true }, // L-shape
      'M': { extended: [], curled: [1, 2, 3, 4] }, // Fist with thumb under
      'N': { extended: [], curled: [1, 2, 3, 4] }, // Similar to M
      'O': { extended: [], curled: [], thumbOut: true }, // Circle/oval
      'P': { extended: [1], curled: [2, 3, 4] }, // K pointing down
      'Q': { extended: [1], curled: [2, 3, 4], thumbOut: true }, // G pointing down
      'R': { extended: [1, 2], curled: [3, 4, 0] }, // Index over middle
      'S': { extended: [], curled: [1, 2, 3, 4] }, // Fist with thumb over
      'T': { extended: [], curled: [1, 2, 3, 4] }, // Thumb between index/middle
      'U': { extended: [1, 2], curled: [3, 4, 0] }, // Index and middle together
      'V': { extended: [1, 2], curled: [3, 4, 0] }, // Peace sign
      'W': { extended: [1, 2, 3], curled: [4, 0] }, // Three fingers up
      'X': { extended: [1], curled: [2, 3, 4, 0] }, // Hooked index
      'Y': { extended: [0, 4], curled: [1, 2, 3] }, // Thumb and pinky out
      'Z': { extended: [1], curled: [2, 3, 4, 0] }, // Index up (motion)
    };
    return configs[letter] || { extended: [], curled: [1, 2, 3, 4] };
  };
  
  const config = getLetterConfig(letter);
  
  // Generate landmarks for each finger (1-20, excluding wrist)
  for (let i = 1; i <= 20; i++) {
    const fingerIdx = Math.floor((i - 1) / 4); // 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
    const jointIdx = (i - 1) % 4; // 0=base, 1=middle, 2=top, 3=tip
    
    let x = 0, y = 0, z = 0;
    
    const isExtended = config.extended.includes(fingerIdx);
    const isCurled = config.curled.includes(fingerIdx);
    
    // Base position varies by finger
    const fingerBaseX = fingerIdx * 0.025; // Spread fingers horizontally
    
    if (isExtended) {
      // Extended finger - landmarks get further from wrist
      x = fingerBaseX + noise();
      y = -0.05 - (jointIdx * 0.035) + noise(); // Extend upward
      z = jointIdx * 0.005 + noise();
    } else if (isCurled) {
      // Curled finger - landmarks curve back toward palm
      x = fingerBaseX + (jointIdx * 0.015) + noise();
      y = -0.03 - (jointIdx * 0.015) + noise(); // Curl down
      z = -0.03 - (jointIdx * 0.015) + noise(); // Curve toward palm
    } else {
      // Neutral/curved position (for C, O shapes)
      const curvature = jointIdx * 0.02;
      x = fingerBaseX + curvature + noise();
      y = -0.05 - (jointIdx * 0.025) + noise();
      z = -0.015 - curvature + noise();
    }
    
    // Thumb special handling
    if (fingerIdx === 0 && config.thumbOut) {
      x = -0.04 + (jointIdx * 0.02) + noise(); // Thumb extends to side
      y = -0.02 - (jointIdx * 0.015) + noise();
      z = 0.02 + (jointIdx * 0.01) + noise();
    }
    
    landmarks.push(x, y, z);
  }
  
  return landmarks;
};

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
