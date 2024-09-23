import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { questionId, fid, option } = body;

    // Update vote count in Questions collection
    const questionRef = doc(db, 'Questions', questionId);
    const updateField = option === 'optionOne' ? 'optionOneVotes' : 'optionTwoVotes';
    
    await updateDoc(questionRef, {
      [updateField]: increment(1),
      totalVotes: increment(1),
    });

    // Update user's response in UserResponses collection
    const userRef = doc(db, 'UserResponses', fid);
    await updateDoc(userRef, {
      [`answeredQuestions.${questionId}`]: option,
    });

    // Generate the next question
    const nextQuestion = await fetchNextQuestion();

    // Create the HTML response for the next frame
    const html = generateNextFrameHtml(nextQuestion);

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in updateVotes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function fetchNextQuestion() {
  const url = 'https://would-you-rather.p.rapidapi.com/wyr/random';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
    }
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  return result[0];
}

function generateNextFrameHtml(question) {
  const options = generateOptions(question.question);
  const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(question.question)}`;

  return `
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
}

function generateOptions(question) {
  const parts = question.split(" or ");
  const option1 = parts[0].replace("Would you rather ", "").trim();
  const option2 = parts[1].replace(/[?.!]$/, "").trim();
  return [option1, option2];
}