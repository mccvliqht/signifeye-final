import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

const AlphabetGuide = () => {
  const { settings } = useApp();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // UPDATED: Standardized phrase list
  const commonPhrases = ['Hello', 'I love you', 'Wait a Minute'];

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

  const isStatic = (letter: string) => {
    return !['J', 'Z'].includes(letter);
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {settings.language} Sign Guide
        </h2>
        <p className="text-muted-foreground">
          Learn the hand positions for each sign. Static signs can be held, 
          while specific signs require movement.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        {/* Common Phrases Section */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-primary">Common Phrases</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {commonPhrases.map((phrase) => (
              <Card key={phrase} className="border-primary/50 bg-primary/5 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold">{phrase}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {getSignDescription(phrase)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alphabet Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Alphabet</h3>
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
                    {getSignDescription(letter)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlphabetGuide;