import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const AlphabetGuide = () => {
  const { settings } = useApp();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const commonPhrases = ['Hello', 'I love you', 'Wait a Minute'];

  // State para sa popup modal (Click to view image)
  const [selectedItem, setSelectedItem] = useState<{title: string, desc: string, image: string} | null>(null);

  const getSignDescription = (sign: string) => {
    const descriptions: Record<string, string> = {
      // Alphabet Descriptions
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
      
      // Phrase Descriptions
      'Hello': 'Open palm starting at forehead and moving outward like a salute',
      'I love you': 'Thumb, index, and pinky fingers extended simultaneously',
      'Wait a Minute': 'Point your index finger straight up with palm facing outward and other fingers in a tight fist.'
    };

    return descriptions[sign] || '';
  };

  // Helper para makuha ang image path
  const getImagePath = (sign: string) => {
    // Kung Phrase, hanapin ang specific name, else use Letter.jpg
    if (sign === 'Hello') return '/signs/Hello.png';
    if (sign === 'I love you') return '/signs/ILoveYou.png';
    if (sign === 'Wait a Minute') return '/signs/Wait.png';
    return `/signs/${sign}.jpg`; 
  };

  const isStatic = (letter: string) => {
    return !['J', 'Z'].includes(letter);
  };

  return (
    <div className="h-full p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">
          {settings.language} Sign Guide
        </h2>
        <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
          Hover over a card to peek at the sign, or click to view a larger version.
          Static signs can be held, while specific signs require movement.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        
        {/* --- COMMON PHRASES SECTION --- */}
        <div className="mb-10">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Common Phrases</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {commonPhrases.map((phrase) => {
               const desc = getSignDescription(phrase);
               const img = getImagePath(phrase);

               return (
                  <Card 
                    key={phrase} 
                    className="group relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
                    onClick={() => setSelectedItem({ title: phrase, desc, image: img })}
                  >
                    <CardHeader className="pb-2 md:pb-3 relative z-10">
                      <CardTitle className="text-lg md:text-xl font-bold text-white">{phrase}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-xs md:text-sm leading-relaxed line-clamp-2">
                        {desc}
                      </CardDescription>
                    </CardContent>

                    {/* HOVER IMAGE OVERLAY */}
                    <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <img 
                        src={img} 
                        alt={phrase}
                        className="w-32 h-32 object-contain drop-shadow-md"
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
          <h3 className="text-lg md:text-xl font-semibold mb-4">Alphabet</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {alphabet.map((letter) => {
               const desc = getSignDescription(letter);
               const img = getImagePath(letter);

               return (
                <Card 
                  key={letter} 
                  className="group relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg h-[180px]"
                  onClick={() => setSelectedItem({ title: letter, desc, image: img })}
                >
                  <CardHeader className="pb-2 md:pb-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl md:text-3xl font-bold text-white">{letter}</CardTitle>
                      {!isStatic(letter) && (
                        <Badge variant="secondary" className="text-[10px] md:text-xs">
                          Motion
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-xs md:text-sm leading-relaxed line-clamp-3">
                      {desc}
                    </CardDescription>
                  </CardContent>

                  {/* HOVER IMAGE OVERLAY */}
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
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-4">
               <span className="text-4xl font-bold text-primary">{selectedItem?.title}</span>
               <div>
                 <DialogTitle>Hand Sign</DialogTitle>
                 <DialogDescription className="mt-1">{selectedItem?.desc}</DialogDescription>
               </div>
            </div>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-6 bg-muted/30 rounded-xl mt-2 border-2 border-dashed border-muted">
             {selectedItem && (
               <img 
                 src={selectedItem.image} 
                 alt={selectedItem.title}
                 className="h-[250px] object-contain rounded-lg drop-shadow-xl"
                 onError={(e) => {
                    // Fallback kung wala talagang image
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