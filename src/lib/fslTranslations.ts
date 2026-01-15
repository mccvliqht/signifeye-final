// Filipino/Tagalog translations for FSL gestures
export const fslToFilipino: Record<string, string> = {
  // --- Alphabet (FSL uses same letters as English) ---
  'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E',
  'F': 'F', 'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J',
  'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O',
  'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T',
  'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y',
  'Z': 'Z',
  
  // --- Common Phrases & New Positional Logic ---
  'Hello': 'Kumusta',
  'Thank you': 'Salamat',
  'I love you': 'Mahal kita',
  'Wait a minute': 'Sandali lang', 
  'Yes': 'Oo',
  'No': 'Hindi',
  'Please': 'Pakiusap', 
  'Sorry': 'Paumanhin', 
  'Fine': 'Maayos',   
  'Help': 'Tulong',
  'Goodbye': 'Paalam',
  'Good morning': 'Magandang umaga',
  'Good night': 'Magandang gabi',
  "You're welcome": 'Walang anuman',
  'Peace': 'Kapayapaan',
  'Good': 'Mabuti',
  'Call Me': 'Tawagan mo ako',
  
  // --- Family & People (Positional Logic) ---
  'Father': 'Tatay',    // 🚀 Derived from OpenHand + Forehead
  'Mother': 'Nanay',    // 🚀 Derived from OpenHand + Chin
  'Think': 'Isip',      // 🚀 Derived from Point + Forehead
  'Me': 'Ako',          // 🚀 Derived from Point + Chest
  'You': 'Ikaw',         // 🚀 Derived from Point + Camera/Forward

  // --- Actions & Questions ---
  'Eat': 'Kain',
  'Drink': 'Inom',
  'Stop': 'Tigil',
  'What': 'Ano',
  'Where': 'Saan',
  'Who': 'Sino',
  'When': 'Kailan',
  'Why': 'Bakit',
  'How': 'Paano',
  
  // --- Objects & Places ---
  'Water': 'Tubig',
  'Bathroom': 'Banyo',
  'Internet': 'Internet',
  'Computer': 'Kompyuter',
  'Phone': 'Telepono',
  'Book': 'Libro',
  'Home': 'Bahay',
  'School': 'Paaralan',
  'Teacher': 'Guro',
  'Student': 'Estudyante',

  // --- Numbers (Both Word and Digit Formats) ---
  'Zero': 'Zero', '0': 'Zero',
  'One': 'Isa', '1': 'Isa',
  'Two': 'Dalawa', '2': 'Dalawa',
  'Three': 'Tatlo', '3': 'Tatlo',
  'Four': 'Apat', '4': 'Apat',
  'Five': 'Lima', '5': 'Lima',
  'Six': 'Anim', '6': 'Anim',
  'Seven': 'Pito', '7': 'Pito',
  'Eight': 'Walo', '8': 'Walo',
  'Nine': 'Siyam', '9': 'Siyam',
  'Ten': 'Sampu', '10': 'Sampu',

  // --- Time ---
  'Today': 'Ngayon',
  'Tomorrow': 'Bukas',
  'Yesterday': 'Kahapon',
  'Morning': 'Umaga',
  'Night': 'Gabi',
};

/**
 * Translates a detected English sign name into its Filipino/Tagalog equivalent.
 * @param englishSign The string name of the gesture detected by the AI.
 */
export const translateToFSL = (englishSign: string): string => {
  // Check if translation exists, otherwise return original
  return fslToFilipino[englishSign] || englishSign;
};