import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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
    const questionText = question.question;

    if (!questionText) {
      throw new Error('Question text is missing');
    }

    // Check if the question is already in Firebase
    let questionId;
    const questionRef = doc(db, 'Questions', questionText);
    const questionDoc = await getDoc(questionRef);

    if (questionDoc.exists()) {
      // Question already exists, use the existing questionId
      questionId = questionDoc.id;
    } else {
      // Question does not exist, add it to Firebase
      const newQuestionRef = doc(db, 'Questions');
      await setDoc(newQuestionRef, {
        questionText: questionText,
        optionOneVotes: 0,
        optionTwoVotes: 0,
      });
      questionId = newQuestionRef.id;  // Firebase-generated questionId
    }

    // Generate two random options
    const options = generateOptions(questionText);

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(questionText)}`;
    console.log('Generated OG Image URL:', ogImageUrl);

    // Return HTML response with proper Farcaster metadata for buttons and images
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
          <p>${questionText}</p>
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

// Function to fetch a random question from the external API
async function fetchQuestion() {
  const url = 'https://would-you-rather.p.rapidapi.com/wyr/random';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
    }
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

// Helper function to split the question into options
function generateOptions(question) {
  const parts = question.split(' or ');
  const option1 = parts[0].replace('Would you rather ', '').trim();
  const option2 = parts[1].replace(/[?.!]$/, '').trim();

  return [option1, option2];
}
