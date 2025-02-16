import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('OPENAI API KEY:', process.env.OPENAI_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received request body:', body);

    if (
      !body.subjects ||
      !Array.isArray(body.subjects) ||
      body.subjects.length === 0
    ) {
      console.error('Invalid subjects in request:', body.subjects);
      return NextResponse.json(
        { error: 'Invalid subjects provided' },
        { status: 400 },
      );
    }

    const { subjects } = body;
    console.log('Processing subjects:', subjects);

    const prompt = `Generate a detailed list of specific subtopics for the following subjects: ${subjects.join(', ')}. 
    For each subject, provide 5-8 specific, focused subtopics that would make interesting learning quests.
    Return the response as a JSON object where each subject is a key and its value is an array of subtopics.
    Example format: {
      "Dance": ["Ballet Fundamentals", "Hip Hop Choreography"],
      "Math": ["Calculus Basics", "Linear Algebra"]
    }`;

    console.log('Calling OpenAI API with prompt...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    console.log('Received OpenAI response');
    const content = completion.choices[0].message.content;

    if (!content) {
      console.error('Empty response from OpenAI');
      throw new Error('Empty response from OpenAI');
    }

    try {
      const subtopicsResponse = JSON.parse(content);
      console.log('Parsed response:', subtopicsResponse);
      return NextResponse.json(subtopicsResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error('Error in generate-subtopics API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate subtopics',
      },
      { status: 500 },
    );
  }
}
