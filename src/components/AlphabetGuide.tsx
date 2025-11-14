import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

const AlphabetGuide = () => {
  const { settings } = useApp();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getLetterDescription = (letter: string) => {
    const aslDescriptions: Record<string, string> = {
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
      Z: 'Index finger traces Z in air'
    };

    return settings.language === 'ASL' 
      ? aslDescriptions[letter] 
      : aslDescriptions[letter]; // FSL similar to ASL for alphabet
  };

  const isStatic = (letter: string) => {
    return !['J', 'Z'].includes(letter);
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {settings.language} Alphabet Guide
        </h2>
        <p className="text-muted-foreground">
          Learn the hand positions for each letter. Static signs can be held, 
          while J and Z require movement.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {alphabet.map((letter) => (
            <Card key={letter} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold">{letter}</CardTitle>
                  {!isStatic(letter) && (
                    <Badge variant="secondary" className="text-xs">
                      Motion
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {getLetterDescription(letter)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlphabetGuide;
