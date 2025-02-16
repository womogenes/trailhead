"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const subjects = [
  "Dance", "Math", "Music", "Art", "Science",
  "Startups", "History", "Writing", "Fitness", "Psychology",
  "Coding", "Philosophy", "Design", "Astronomy", "Business",
  "Cooking", "Film", "Poetry", "Engineering", "Environment"
];

// Add subtopics mapping
const subtopicsMap = {
  Dance: ["Ballet", "Hip Hop", "Contemporary", "Ballroom", "Jazz", "Street Dance", "Traditional Dance", "Choreography"],
  Math: ["Calculus", "Statistics", "Linear Algebra", "Number Theory", "Geometry", "Applied Mathematics", "Logic"],
  Music: ["Piano", "Guitar", "Music Theory", "Music Production", "Singing", "Music History", "Sound Design"],
  // ... add mappings for other subjects as needed
};

const RecsPage = () => {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const text = "Sidequests".split("");

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
      localStorage.setItem('selectedSubjects', JSON.stringify(Array.from(selectedSubjects)));
      // Navigate to subtopics page
      router.push('/recs/subtopics');
    } else {
      alert("Please select at least one subject!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100">
      {!started ? (
        <div className="flex flex-col items-center gap-4">
          {/* Welcome Text with Animation */}
          <p className="text-center z-20 rounded-br-md px-6 py-4 text-2xl font-medium">
            Welcome to{" "}
            <span className="text-green-800 italic inline-flex">
              {text.map((letter, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  animate={{ x: [-3, 3, -3] }} // Moves letters side to side
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.1, // Stagger effect
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </p>

          {/* Get Started Button */}
          <Button
            onClick={() => setStarted(true)}
            className="bg-purple-700/70 text-white px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-purple-800 active:bg-purple-900"
          >
            Get Started
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* Grid of Subject Buttons */}
          <div className="grid grid-cols-5 grid-rows-4 gap-4">
            {subjects.map((subject) => (
              <Button
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300
                  ${selectedSubjects.has(subject) ? "bg-green-400" : "bg-green-600"}
                  text-white hover:bg-green-500 active:bg-green-700`}
              >
                {subject}
              </Button>
            ))}
          </div>

          {/* Bigger Done Button */}
          <Button
            onClick={handleDone}
            className="bg-blue-600 text-white px-8 py-4 text-xl rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 active:bg-blue-800"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecsPage;