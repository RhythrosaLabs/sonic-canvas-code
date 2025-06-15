
import React, { useState } from 'react';
import { Book, ChevronDown, ChevronRight, Code, Volume2, Eye, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: {
    description: string;
    examples: { code: string; description: string }[];
    advanced?: { code: string; description: string }[];
  };
}

const CodingGuide = () => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const audioSections: GuideSection[] = [
    {
      id: 'audio-basics',
      title: 'Audio Fundamentals',
      icon: <Volume2 className="w-4 h-4" />,
      content: {
        description: 'Learn the core audio synthesis concepts and basic note playing.',
        examples: [
          {
            code: 'play :C4, amp: 0.8, release: 0.5',
            description: 'Play a C4 note with 80% amplitude and 0.5s release'
          },
          {
            code: 'sleep 1.0',
            description: 'Wait for 1 second before next instruction'
          },
          {
            code: 'set_tempo 140',
            description: 'Change the global tempo to 140 BPM'
          }
        ],
        advanced: [
          {
            code: 'with_synth :saw do\n  play chord(:Am, :seventh), sustain: 2\nend',
            description: 'Use sawtooth wave to play Am7 chord with sustain'
          }
        ]
      }
    },
    {
      id: 'audio-synthesis',
      title: 'Advanced Synthesis',
      icon: <Code className="w-4 h-4" />,
      content: {
        description: 'Master complex synthesis techniques, modulation, and sound design.',
        examples: [
          {
            code: 'synth :fm, carrier: 440, modulator: 220, depth: 0.8',
            description: 'Create FM synthesis with carrier and modulator frequencies'
          },
          {
            code: 'filter :lpf, cutoff: 800, resonance: 0.7',
            description: 'Apply low-pass filter with cutoff frequency and resonance'
          },
          {
            code: 'envelope attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.0',
            description: 'Define ADSR envelope for amplitude shaping'
          }
        ],
        advanced: [
          {
            code: 'modulate :cutoff do\n  lfo :sine, rate: 2, depth: 400\nend',
            description: 'Modulate filter cutoff with sine wave LFO'
          }
        ]
      }
    },
    {
      id: 'audio-effects',
      title: 'Effects & Processing',
      icon: <Lightbulb className="w-4 h-4" />,
      content: {
        description: 'Apply real-time effects and audio processing chains.',
        examples: [
          {
            code: 'with_fx :reverb, room: 0.8, damp: 0.5 do\n  play :C4\nend',
            description: 'Add reverb effect with room size and damping'
          },
          {
            code: 'with_fx :delay, time: 0.25, feedback: 0.6 do',
            description: 'Create delay effect with quarter-note timing'
          },
          {
            code: 'compress threshold: -12, ratio: 4, attack: 0.01',
            description: 'Apply dynamic compression to control dynamics'
          }
        ]
      }
    }
  ];

  const visualSections: GuideSection[] = [
    {
      id: 'visual-basics',
      title: 'Visual Fundamentals',
      icon: <Eye className="w-4 h-4" />,
      content: {
        description: 'Start with basic shapes, colors, and transformations.',
        examples: [
          {
            code: 'bg(0.1, 0.05, 0.2, 0.8)',
            description: 'Set background color with RGB and alpha values'
          },
          {
            code: 'circle().scale(2).color(1, 0.5, 0)',
            description: 'Create orange circle scaled 2x larger'
          },
          {
            code: 'rect(100, 50).rotate(45).translate(10, 20)',
            description: 'Create rectangle, rotate 45°, move to position'
          }
        ],
        advanced: [
          {
            code: 'shape(8).radius(() => audio.amp * 100 + 50)',
            description: 'Create octagon with audio-reactive radius'
          }
        ]
      }
    },
    {
      id: 'visual-animation',
      title: 'Animation & Motion',
      icon: <Code className="w-4 h-4" />,
      content: {
        description: 'Create dynamic animations synchronized with audio data.',
        examples: [
          {
            code: 'oscillate("x", min: -50, max: 50, speed: 2)',
            description: 'Oscillate X position between -50 and 50'
          },
          {
            code: 'rotate(() => time * 60)',
            description: 'Continuous rotation based on time'
          },
          {
            code: 'scale(() => 1 + audio.beat * 0.5)',
            description: 'Scale up by 50% when beat is detected'
          }
        ],
        advanced: [
          {
            code: 'bezier(start: [0,0], cp1: [100,0], cp2: [100,100], end: [0,100])\n  .progress(() => audio.phase)',
            description: 'Animate along Bezier curve based on audio phase'
          }
        ]
      }
    },
    {
      id: 'visual-effects',
      title: 'Visual Effects',
      icon: <Lightbulb className="w-4 h-4" />,
      content: {
        description: 'Master advanced visual effects and compositing techniques.',
        examples: [
          {
            code: 'blur(intensity: 5).glow(color: [1,1,1], size: 10)',
            description: 'Apply blur and white glow effects'
          },
          {
            code: 'blend("multiply").opacity(0.7)',
            description: 'Set multiply blend mode with 70% opacity'
          },
          {
            code: 'trail(length: 20, fade: 0.95)',
            description: 'Create motion trail with 20 frames and 95% fade'
          }
        ],
        advanced: [
          {
            code: 'shader("fragment") {\n  vec3 color = hsv(audio.freq/1000, 1.0, 1.0);\n  gl_FragColor = vec4(color, 1.0);\n}',
            description: 'Custom fragment shader with audio-reactive HSV color'
          }
        ]
      }
    }
  ];

  const renderSection = (section: GuideSection) => (
    <Card key={section.id} className="mb-4">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection(section.id)}
          >
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </div>
              {openSections.has(section.id) ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              }
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">{section.content.description}</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Basic Examples:</h4>
                {section.content.examples.map((example, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <code className="text-xs font-mono text-purple-700 block mb-1">
                      {example.code}
                    </code>
                    <p className="text-xs text-gray-600">{example.description}</p>
                  </div>
                ))}
              </div>
              
              {section.content.advanced && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Advanced Examples:</h4>
                  {section.content.advanced.map((example, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-blue-50 rounded-lg border-l-2 border-blue-300">
                      <code className="text-xs font-mono text-blue-700 block mb-1 whitespace-pre">
                        {example.code}
                      </code>
                      <p className="text-xs text-gray-600">{example.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Book className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-800">SynthVis Language Guide</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Audio Programming
          </h3>
          {audioSections.map(renderSection)}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visual Programming
          </h3>
          {visualSections.map(renderSection)}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-sm mb-2 text-purple-700">💡 Pro Tip: Audio-Visual Sync</h4>
        <p className="text-xs text-gray-700 mb-2">
          Use <code className="bg-white px-1 rounded">audio.amp</code>, <code className="bg-white px-1 rounded">audio.freq</code>, 
          <code className="bg-white px-1 rounded">audio.beat</code>, and <code className="bg-white px-1 rounded">audio.phase</code> 
          in your visual code to create reactive animations.
        </p>
        <code className="text-xs font-mono text-purple-700 block">
          circle().scale(() => audio.amp * 3 + 0.5).color(() => audio.freq/1000, 0.8, 1)
        </code>
      </div>
    </div>
  );
};

export default CodingGuide;
