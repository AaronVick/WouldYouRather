import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  console.log('Received request method:', req.method);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    console.log('Fetching question...');
    const questionData = await fetchQuestion();  // Fetch question from API or Firebase
    const questionId = 'exampleQuestionId';  // This should be the dynamically generated question ID from Firebase

    if (!questionData || !Array.isArray(questionData) || questionData.length === 0) {
      throw new Error('Invalid question data received');
    }

    const question = questionData[0];

    if (!question.question) {
      throw new Error('Question text is missing');
    }

    const options = generateOptions(question.question);

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(question.question)}`;
    console.log('Generated OG Image URL:', ogImageUrl);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Would You Rather</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${options[0]}" />
          <meta property="fc:frame:button:2" content="${options[1]}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${question.question}</p>
        </body>
      </html>
    `;

    console.log('Sending HTML response');
    return new NextResponse(
      JSON.stringify({
        html: html,
        questionId: questionId,  // Pass the dynamic questionId
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
