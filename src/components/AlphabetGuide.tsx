import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Type } from 'lucide-react'; // Added icons for better aesthetics

const AlphabetGuide = () => {
  const { settings } = useApp();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // 1. Updated List
  const rawPhrases = [
    'Hello', 'I love you', 'Wait a Minute', 'Yes', 'No', 'Good',
    'Water', 'Peace', 'Father', 'Mother', 'Fine', 'Call Me',
    'Drink', 'You', 'I/Me', 'Think', 'Please', 'Sorry'
  ];

  const commonPhrases = rawPhrases.sort((a, b) => a.localeCompare(b));

  const [selectedItem, setSelectedItem] = useState<{title: string, desc: string, image: string} | null>(null);

  const getSignDescription = (sign: string) => {
    const descriptions: Record<string, string> = {
      A: 'Closed fist with thumb alongside',
      B: 'Flat hand, fingers together, thumb across palm',
      C: 'Curved hand forming C shape',
      D: 'Index finger up, other fingers touching thumb',
      E: 'Fingers curled down, thumb across',
      F: 'Index and thumb form circle, other fingers up',
      G: 'Index and thumb pointing, others curled',
      H: 'Index and middle fingers extended sideways',
      I: 'Pinky finger up, others curled',
      J: 'Pinky up, trace J in air',
      K: 'Index and middle up in V, thumb between',
      L: 'Index and thumb form L shape',
      M: 'Thumb under first three fingers',
      N: 'Thumb under first two fingers',
      O: 'All fingers form O shape',
      P: 'Index and middle pointing down, thumb between',
      Q: 'Index and thumb pointing down',
      R: 'Index and middle crossed',
      S: 'Fist with thumb across fingers',
      T: 'Thumb between index and middle',
      U: 'Index and middle up together',
      V: 'Index and middle up in V',
      W: 'Index, middle, ring up',
      X: 'Index finger bent, hook shape',
      Y: 'Thumb and pinky extended',
      Z: 'Index finger traces Z in air',
      
      'Hello': 'Open palm starting at forehead and moving outward like a salute.',
      'I love you': 'Thumb, index, and pinky fingers extended simultaneously.',
      'Wait a Minute': 'Point your index finger straight up with palm facing outward.',
      'Yes': 'A closed fist (S-hand) making a nodding motion up and down.',
      'No': 'Index and middle fingers tapping the thumb (simulating a beak).',
      'Good': 'Thumbs up gesture (or hand moving from chin to palm).',
      'Water': 'Index, middle, and ring fingers up (W-shape) tapping the chin.',
      'Peace': 'Index and middle fingers extended in a V shape.',
      'Father': 'Open hand with thumb touching the forehead.',
      'Mother': 'Open hand with thumb touching the chin.',
      'Fine': 'Open hand with thumb touching the chest.',
      'Call Me': 'Thumb and pinky extended (Y-shape) held near the ear.',
      'Drink': 'Hand forming a C shape moving towards the mouth.',
      'You': 'Index finger pointing straight forward at the other person.',
      'I/Me': 'Index finger pointing at your own chest.',
      'Think': 'Index finger touching or tapping the forehead.',
      'Please': 'Flat hand rubbing the chest in a circular motion.',
      'Sorry': 'Closed fist rubbing the chest in a circular motion.'
    };
    return descriptions[sign] || 'Hand sign description.';
  };

  const getImagePath = (sign: string) => {
    switch (sign) {
        case 'I love you': return '/signs/words/iloveyou.jpg';
        case 'Water': return '/signs/words/water.jpg';
        case 'Call Me': return '/signs/words/call.png';
        case 'I/Me': return '/signs/words/me.png';
        case 'Drink': return '/signs/words/drink.jpg';
        case 'Father': return '/signs/words/father.jpg';
        case 'Mother': return '/signs/words/mother.jpg';
        case 'Fine': return '/signs/words/fine.png';
        case 'No': return '/signs/words/no.jpg';
        case 'Peace': return '/signs/words/peace.jpg';
        case 'Please': return '/signs/words/please.jpg';
        case 'Sorry': return '/signs/words/sorry.jpg';
        case 'Think': return '/signs/words/think.png';
        case 'Yes': return '/signs/words/yes.jpg';
        case 'You': return '/signs/words/you.png';
        default: return `/signs/words/${sign.replace(/\s+/g, '')}.jpg`;
    }
  };

  const isStatic = (letter: string) => {
    return !['J', 'Z'].includes(letter);
  };

  return (
    <div className="h-full p-4 md:p-6 bg-background text-foreground">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
          {settings.language} Sign Guide
        </h2>
        <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
          Hover over a card to peek at the sign, or click to view a larger version.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        
        {/* --- COMMON PHRASES SECTION --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
             <BookOpen className="w-5 h-5 text-primary" />
             <h3 className="text-lg md:text-xl font-semibold">Common Phrases <span className="text-muted-foreground text-sm font-normal"></span></h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {commonPhrases.map((phrase) => {
               const desc = getSignDescription(phrase);
               const img = getImagePath(phrase);

               return (
                  <Card 
                    key={phrase} 
                    // FIXED: Added h-[180px] to match Alphabet cards
                    className="group relative overflow-hidden cursor-pointer border border-border bg-card hover:border-primary transition-all hover:shadow-md h-[180px]"
                    onClick={() => setSelectedItem({ title: phrase, desc, image: img })}
                  >
                    <CardHeader className="pb-2 md:pb-3 relative z-10">
                      <CardTitle className="text-lg md:text-xl font-bold text-card-foreground">{phrase}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-xs md:text-sm leading-relaxed line-clamp-2 text-muted-foreground">
                        {desc}
                      </CardDescription>
                    </CardContent>

                    <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <img 
                        src={img} 
                        alt={phrase}
                        // FIXED: Changed size to w-24 h-24 to match Alphabet cards (was w-32 h-32)
                        className="w-24 h-24 object-contain drop-shadow-md"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Click to enlarge</span>
                    </div>
                  </Card>
               );
            })}
          </div>
        </div>

        {/* --- ALPHABET SECTION --- */}
        <div>
          <div className="flex items-center gap-2 mb-4">
             <Type className="w-5 h-5 text-primary" />
             <h3 className="text-lg md:text-xl font-semibold">Alphabet</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {alphabet.map((letter) => {
               const desc = getSignDescription(letter);
               const img = `/signs/${letter}.jpg`; 

               return (
                <Card 
                  key={letter} 
                  className="group relative overflow-hidden cursor-pointer border border-border bg-card hover:border-primary transition-all hover:shadow-md h-[180px]"
                  onClick={() => setSelectedItem({ title: letter, desc, image: img })}
                >
                  <CardHeader className="pb-2 md:pb-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl md:text-3xl font-bold text-card-foreground">{letter}</CardTitle>
                      {!isStatic(letter) && (
                        <Badge variant="outline" className="text-[10px] md:text-xs border-primary text-primary">
                          Motion
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-xs md:text-sm leading-relaxed line-clamp-3 text-muted-foreground">
                      {desc}
                    </CardDescription>
                  </CardContent>

                  <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <img 
                        src={img} 
                        alt={letter}
                        className="w-24 h-24 object-contain drop-shadow-md"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Click to View</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* --- POPUP DIALOG (MODAL) --- */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-4">
               <span className="text-4xl font-bold text-primary">{selectedItem?.title}</span>
               <div>
                 <DialogTitle>Hand Sign</DialogTitle>
                 <DialogDescription className="mt-1 text-muted-foreground">{selectedItem?.desc}</DialogDescription>
               </div>
            </div>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-6 bg-muted/50 rounded-xl mt-2 border-2 border-dashed border-border">
             {selectedItem && (
               <img 
                 src={selectedItem.image} 
                 alt={selectedItem.title}
                 className="h-[250px] object-contain rounded-lg drop-shadow-xl"
                 onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x400?text=No+Image";
                 }}
               />
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlphabetGuide;