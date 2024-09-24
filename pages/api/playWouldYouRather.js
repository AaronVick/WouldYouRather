import { NextResponse } from 'next/server';
import { db } from './firebaseAdmin'; // Correct path to firebaseAdmin

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const fid = req.headers.get('farcaster-fid') || null;
    if (!fid) {
      throw new Error('Farcaster FID not found');
    }

    const questionData = await fetchQuestion();

    if (!questionData || !questionData.length) {
      throw new Error('No question fetched from API');
    }

    const question = questionData[0];
    const questionText = question.question;

    const existingQuestion = await db.collection('Questions')
      .where('text', '==', questionText)
      .get();

    let questionId;
    if (existingQuestion.empty) {
      const newQuestionRef = db.collection('Questions').doc();
      await newQuestionRef.set({
        text: questionText,
        optionOneText: question.optionOne,
        optionTwoText: question.optionTwo,
        optionOneVotes: 0,
        optionTwoVotes: 0,
        totalVotes: 0,
      });
      questionId = newQuestionRef.id;
    } else {
      questionId = existingQuestion.docs[0].id;
    }

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?questionId=${questionId}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Would You Rather</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${question.optionOne}" />
          <meta property="fc:frame:button:2" content="${question.optionTwo}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes" />
        </head>
        <body>
          <h1>Would You Rather</h1>
        </body>
      </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

async function fetchQuestion() {
  const response = await fetch('https://would-you-rather.p.rapidapi.com/wyr/random', {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
    },
  });
  return response.json();
}
