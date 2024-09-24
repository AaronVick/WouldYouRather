import { NextResponse } from 'next/server';
import { db } from './firebaseAdmin';  // Correct path assuming it's in /pages/api/

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
    const questionData = await fetchQuestion();
    console.log('Fetched question:', JSON.stringify(questionData));

    if (!questionData || !Array.isArray(questionData) || questionData.length === 0) {
      throw new Error('Invalid question data received');
    }

    const question = questionData[0];
    const existingQuestion = await checkIfQuestionExists(question);

    let questionID;
    if (!existingQuestion) {
      questionID = await addQuestionToFirestore(question);
    } else {
      questionID = existingQuestion.id;
    }

    const options = generateOptions(question.question);
    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(question.question)}`;

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
          <meta property="fc:frame:questionID" content="${questionID}" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${question.question}</p>
        </body>
      </html>
    `;

    console.log('Sending HTML response');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

async function fetchQuestion() {
  const url = 'https://would-you-rather.p.rapidapi.com/wyr/random';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com',
    },
  };

  console.log('Fetching question from API...');
  console.log('API Key (last 4 chars):', process.env.XRapidAPIKey ? process.env.XRapidAPIKey.slice(-4) : 'Not set');

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error('API Response:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
}

async function checkIfQuestionExists(question) {
  const questionText = question.question;
  const questionQuery = db.collection('Questions').where('questionText', '==', questionText).limit(1);
  const snapshot = await questionQuery.get();
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0];
}

async function addQuestionToFirestore(question) {
  const newQuestion = {
    optionOneText: 'Option 1 Text',
    optionTwoText: 'Option 2 Text',
    totalVotes: 0,
    optionOneVotes: 0,
    optionTwoVotes: 0,
    questionText: question.question,
  };
  
  const questionRef = await db.collection('Questions').add(newQuestion);
  return questionRef.id;
}

function generateOptions(question) {
  const parts = question.split(' or ');
  const option1 = parts[0].replace('Would you rather ', '').trim();
  const option2 = parts[1].replace(/[?.!]$/, '').trim();
  return [option1, option2];
}
