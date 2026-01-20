import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Users, Camera, HandMetal } from 'lucide-react';

const AboutContent = () => {
  return (
    <div className="h-full p-4 md:p-6 max-w-6xl mx-auto space-y-8 md:space-y-12 pb-10">
      
      {/* 🚀 Header Section: Justified and smaller text for mobile */}
      <div className="text-center mb-6 md:mb-10 mt-4 md:mt-6">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 md:mb-5 text-foreground">
          SignifEye
        </h2>
        {/* 🛠️ UPDATED: text-xs and text-justify for mobile */}
        <p className="text-xs md:text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 text-justify md:text-center">
          SignifEye is an AI-powered recognition system that bridges communication gaps between the Deaf and hearing communities through real-time landmark detection, serving as a dedicated <span className="text-foreground font-semibold">learning tool</span> designed to help users master basic signs and alphabets in ASL and FSL with room for advanced future optimizations.
        </p>
      </div>

      <ScrollArea className="h-auto pr-2 md:pr-4">
        <div className="grid gap-8 md:gap-10">
          
          {/* 👥 About the Developers Section: Now with justified text */}
          <section className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-1">
              <Users className="text-primary w-5 h-5 md:w-6 md:h-6" />
              <h3 className="text-xl md:text-2xl font-bold text-foreground">About the Developers</h3>
            </div>
            <Card className="bg-card border-primary/10 p-4 md:p-6 shadow-sm">
              {/* 🛠️ UPDATED: text-xs and text-justify for mobile */}
              <CardContent className="text-xs md:text-base text-muted-foreground leading-relaxed p-0 text-justify md:text-left">
                As a team of <span className="text-foreground font-semibold">Filipino student developers</span>, we created this platform for our capstone project with the mission to provide an accessible <span className="text-foreground font-semibold">learning tool</span> for those interested in American Sign Language (ASL) and Filipino Sign Language (FSL). Through this initiative, we aim to foster greater inclusivity and understanding within our community using technology, and we are dedicated to continuously <span className="text-foreground font-semibold">optimizing and expanding</span> the system’s capabilities in the future.
              </CardContent>
            </Card>
          </section>

          {/* 💡 Recommendations Section */}
          <section className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-1">
              <Lightbulb className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" />
              <h3 className="text-xl md:text-2xl font-bold text-foreground">Recommendations</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Environment Card */}
              <Card className="border-none bg-primary/5">
                <CardHeader className="flex flex-row items-center gap-3 py-3 md:py-4">
                  <Camera className="text-primary w-4 h-4 md:w-5 md:h-5" />
                  <CardTitle className="text-sm md:text-lg text-foreground">Environment & Setup</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 md:pb-6">
                  <ul className="text-[10px] md:text-sm space-y-2 md:space-y-4">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Lighting:</strong> Ensure you are in a well-lit area with light facing your hands.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Background:</strong> Keep your background clear of other hands to prevent misidentification.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Distance:</strong> Stay 2 to 3 feet away from the camera.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Signing Card */}
              <Card className="border-none bg-secondary/20">
                <CardHeader className="flex flex-row items-center gap-3 py-3 md:py-4">
                  <HandMetal className="text-primary w-4 h-4 md:w-5 md:h-5" />
                  <CardTitle className="text-sm md:text-lg text-foreground">Signing Accuracy</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 md:pb-6">
                  <ul className="text-[10px] md:text-sm space-y-2 md:space-y-4">
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
                      <span><strong>Deliberate Motion:</strong> Maintain a steady or static hand position for all signs.</span>
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