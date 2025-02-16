'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WatercolorFruit } from '@/components/ui/watercolor-fruit';

interface SubtopicCard {
  subject: string;
  subtopic: string;
  fruitType:
    | 'apple'
    | 'orange'
    | 'kiwi'
    | 'banana'
    | 'grape'
    | 'strawberry'
    | 'pear'
    | 'plum';
}

const fruitTypes = [
  'apple',
  'orange',
  'kiwi',
  'banana',
  'grape',
  'strawberry',
  'pear',
  'plum',
] as const;

const fruitImages = {
  apple: '/fruits/apple-watercolor.png',
  orange: '/fruits/orange-watercolor.png',
  kiwi: '/fruits/kiwi-watercolor.png',
  banana: '/fruits/banana-watercolor.png',
  grape: '/fruits/grape-watercolor.png',
  strawberry: '/fruits/strawberry-watercolor.png',
  pear: '/fruits/pear-watercolor.png',
  plum: '/fruits/plum-watercolor.png',
};

export default function SubtopicsPage() {
  const [subtopicCards, setSubtopicCards] = useState<SubtopicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSubtopics = async () => {
      try {
        const selectedSubjects = JSON.parse(
          localStorage.getItem('selectedSubjects') || '[]',
        );
        console.log('Selected subjects:', selectedSubjects);

        if (selectedSubjects.length === 0) {
          setError('No subjects selected');
          setLoading(false);
          return;
        }

        console.log('Calling generate-subtopics API...');
        const response = await fetch('/api/generate-subtopics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjects: selectedSubjects }),
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error Response:', errorData);
          throw new Error(
            `Failed to generate subtopics: ${response.status} ${errorData}`,
          );
        }

        const data = await response.json();
        console.log('API Response data:', data);

        // Type guard to ensure data has the expected structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format from API');
        }

        // Transform the response into cards
        const cards = Object.entries(data).flatMap(
          ([subject, subtopics]: [string, any]) => {
            if (!Array.isArray(subtopics)) {
              console.warn(
                `Invalid subtopics format for subject ${subject}:`,
                subtopics,
              );
              return [];
            }

            return subtopics.map((subtopic) => ({
              subject,
              subtopic,
              fruitType: fruitTypes[
                Math.floor(Math.random() * fruitTypes.length)
              ] as SubtopicCard['fruitType'],
            }));
          },
        );

        console.log('Generated cards:', cards);
        setSubtopicCards(cards);
      } catch (err) {
        console.error('Error in generateSubtopics:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Error generating subtopics. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    generateSubtopics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Growing your garden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-muted-foreground mb-6 text-xl">{error}</p>
          <button
            onClick={() => (window.location.href = '/recs')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 transition-colors duration-200"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden bg-white p-8',
        'bg-[radial-gradient(circle_at_center,var(--muted)_1px,transparent_1px)] bg-[size:24px_24px]',
      )}
    >
      {/* Subtle Background Pattern */}
      <div className="to-muted/20 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <h1 className="text-foreground mb-12 text-center text-3xl font-medium">
          Your Learning Path
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subtopicCards.map((card, index) => (
            <motion.div
              key={`${card.subject}-${card.subtopic}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/?query=${card.subtopic}`}>
                <Card className="bg-background border-border hover:border-primary/50 group relative rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="flex flex-col items-center">
                    <WatercolorFruit
                      type={card.fruitType}
                      className="transform transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="text-center">
                      <h3 className="text-foreground group-hover:text-primary mb-3 text-lg leading-tight transition-colors duration-200">
                        {card.subtopic}
                      </h3>
                      <div className="bg-muted inline-block rounded-full px-3 py-1">
                        <p className="text-muted-foreground text-sm">
                          {card.subject}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
