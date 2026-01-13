import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Users, Camera, HandMetal } from 'lucide-react';

const AboutContent = () => {
  return (
    <div className="h-full p-6 max-w-6xl mx-auto space-y-12 pb-10">
      
      {/* 🚀 Header Section: text-foreground ensures visibility in both modes */}
      <div className="text-center mb-12 mt-8">
        <h2 className="text-5xl font-extrabold tracking-tight mb-6 text-foreground">
          SignifEye
        </h2>
        <p className="text-xl text-muted-foreground max-w-5xl mx-auto leading-relaxed">
          SignifEye is an AI-powered recognition system that bridges communication gaps between the Deaf and hearing communities through real-time landmark detection, serving as a dedicated <span className="text-foreground font-semibold">learning tool</span> designed to help users master basic signs and alphabets in ASL and FSL with room for advanced future optimizations.
        </p>
      </div>

      <ScrollArea className="h-auto pr-4">
        <div className="grid gap-10">
          
          {/* 👥 About the Developers Section: Using theme-aware classes */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-primary w-6 h-6" />
              <h3 className="text-2xl font-bold text-foreground">About the Developers</h3>
            </div>
            <Card className="bg-card border-primary/10 p-6 shadow-sm">
              <CardContent className="text-base text-muted-foreground leading-relaxed p-0">
                As a team of <span className="text-foreground font-semibold">Filipino student developers</span>, we created this platform for our capstone project with the mission to provide an accessible <span className="text-foreground font-semibold">learning tool</span> for those interested in American Sign Language (ASL) and Filipino Sign Language (FSL). Through this initiative, we aim to foster greater inclusivity and understanding within our community using technology, and we are dedicated to continuously <span className="text-foreground font-semibold">optimizing and expanding</span> the system’s capabilities in the future.
              </CardContent>
            </Card>
          </section>

          {/* 💡 Recommendations Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="text-yellow-500 w-6 h-6" />
              <h3 className="text-2xl font-bold text-foreground">Recommendations for Best Results</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Environment Card */}
              <Card className="border-none bg-primary/5">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Camera className="text-primary w-5 h-5" />
                  <CardTitle className="text-lg text-foreground">Environment & Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-4">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Lighting:</strong> Ensure you are in a well-lit area with light facing your hands.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Background:</strong> Ensure your background is clear of other hands or finger-like shapes to prevent the AI from misidentifying landmarks.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Distance:</strong> Stay approximately 2 to 3 feet away from the camera for a clear view.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Signing Card */}
              <Card className="border-none bg-secondary/20">
                <CardHeader className="flex flex-row items-center gap-3">
                  <HandMetal className="text-primary w-5 h-5" />
                  <CardTitle className="text-lg text-foreground">Signing Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-4">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Right Hand:</strong> This model is currently optimized for right-handed signers.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Hand Positioning:</strong> Keep your palm facing primarily toward the camera lens.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Deliberate Motion:</strong> For moving signs like J and Z, use smooth and steady movements.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
};

export default AboutContent;