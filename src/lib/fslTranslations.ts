// Filipino/Tagalog translations for FSL gestures
export const fslToFilipino: Record<string, string> = {
  // Alphabet - FSL uses same letters as English
  'A': 'A',
  'B': 'B',
  'C': 'C',
  'D': 'D',
  'E': 'E',
  'F': 'F',
  'G': 'G',
  'H': 'H',
  'I': 'I',
  'J': 'J',
  'K': 'K',
  'L': 'L',
  'M': 'M',
  'N': 'N',
  'O': 'O',
  'P': 'P',
  'Q': 'Q',
  'R': 'R',
  'S': 'S',
  'T': 'T',
  'U': 'U',
  'V': 'V',
  'W': 'W',
  'X': 'X',
  'Y': 'Y',
  'Z': 'Z',
  
  // Common phrases
  'Hello': 'Kumusta',
  'Thank you': 'Salamat',
  'Yes': 'Oo',
  'No': 'Hindi',
  'Please': 'Pakiusap',
  'Sorry': 'Pasensya',
  'Help': 'Tulong',
  'Goodbye': 'Paalam',
  'I love you': 'Mahal kita',
  'Good morning': 'Magandang umaga',
  'Good night': 'Magandang gabi',
  'Excuse me': 'Excuse me',
  "You're welcome": 'Walang anuman',
  'What': 'Ano',
  'Where': 'Saan',
  
  // Additional words
  'Stop': 'Tigil',
  'Water': 'Tubig',
  'Bathroom': 'Banyo',
  'Eat': 'Kain',
  'Drink': 'Inom',
  'Internet': 'Internet',
  'Computer': 'Kompyuter',
  'Phone': 'Telepono',
  'Book': 'Libro',
  'Home': 'Bahay',
  'School': 'Paaralan',
  'Teacher': 'Guro',
  'Student': 'Estudyante',

  // Numbers
  'Zero': 'Zero',
  'One': 'Isa',
  'Two': 'Dalawa',
  'Three': 'Tatlo',
  'Four': 'Apat',
  'Five': 'Lima',
  'Six': 'Anim',
  'Seven': 'Pito',
  'Eight': 'Walo',
  'Nine': 'Siyam',
  'Ten': 'Sampu',

  // Questions
  'Who': 'Sino',
  'When': 'Kailan',
  'Why': 'Bakit',
  'How': 'Paano',

  // Time
  'Today': 'Ngayon',
  'Tomorrow': 'Bukas',
  'Yesterday': 'Kahapon',
  'Morning': 'Umaga',
  'Night': 'Gabi',
};

export const translateToFSL = (englishSign: string): string => {
  // Check if translation exists, otherwise return original
  return fslToFilipino[englishSign] || englishSign;
};