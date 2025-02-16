'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const subjects = [
  'Dance',
  'Math',
  'Music',
  'Art',
  'Science',
  'Startups',
  'History',
  'Writing',
  'Fitness',
  'Psychology',
  'Coding',
  'Philosophy',
  'Design',
  'Astronomy',
  'Business',
  'Cooking',
  'Film',
  'Poetry',
  'Engineering',
  'Environment',
];

const RecsPage = () => {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set(),
  );
  const text = 'Sidequests'.split('');

  // Update toggleSubject with proper typing
  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prevSelected) => {
      const newSet = new Set(prevSelected);
      if (newSet.has(subject)) {
        newSet.delete(subject);
      } else {
        newSet.add(subject);
      }
      return newSet;
    });
  };

  // Handle completion of subject selection
  const handleDone = () => {
    if (selectedSubjects.size > 0) {
      // Store selected subjects in localStorage or state management solution
      localStorage.setItem(
        'selectedSubjects',
        JSON.stringify(Array.from(selectedSubjects)),
      );
      // Navigate to subtopics page
      router.push('/recs/subtopics');
    } else {
      alert('Please select at least one subject!');
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100">
      {!started ? (
        <div className="flex flex-col items-center gap-4">
          {/* Welcome Text with Animation */}
          <p className="z-20 rounded-br-md px-6 py-4 text-center text-2xl font-medium">
            Welcome to <span className="text-primary">Sidequests</span>
          </p>

          {/* Get Started Button */}
          <Button onClick={() => setStarted(true)}>Get Started</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* Grid of Subject Buttons */}
          <p className="text-muted-foreground">
            Select any number of subjects:
          </p>
          <div className="grid grid-cols-5 grid-rows-4 gap-4">
            {subjects.map((subject) => (
              <Button
                className={cn(
                  selectedSubjects.has(subject)
                    ? 'bg-primary'
                    : 'bg-muted-foreground',
                  'transition-colors',
                )}
                key={subject}
                onClick={() => toggleSubject(subject)}
              >
                {subject}
              </Button>
            ))}
          </div>

          {/* Bigger Done Button */}
          <Button onClick={handleDone}>Done</Button>
        </div>
      )}
    </div>
  );
};

export default RecsPage;
