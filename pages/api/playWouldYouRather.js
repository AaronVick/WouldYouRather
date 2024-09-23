import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Firebase configuration
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
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const fid = req.headers.get('farcaster-fid'); // Assuming the fid comes from Farcaster headers.
    console.log('Farcaster fid:', fid);

    console.log('Fetching question...');
    const questionData = await fetchQuestion();
    const questionText = questionData[0]?.question;

    if (!questionText) {
      throw new Error('Question text is missing');
    }

    // Generate two random options from the question text
    const options = generateOptions(questionText);

    // Check if the question already exists in Firebase
    let questionId;
    const questionsRef = collection(db, 'Questions');
    const q = query(questionsRef, where('questionText', '==', questionText));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Question exists, use the existing document ID
      questionId = querySnapshot.docs[0].id;
      console.log('Question already exists in Firebase with ID:', questionId);
    } else {
      // Question does not exist, so add it to Firebase
      const newQuestionRef = await addDoc(collection(db, 'Questions'), {
        questionText: questionText,
        optionOneVotes: 0,
        optionTwoVotes: 0,
      });
      questionId = newQuestionRef.id;
      console.log('Added new question to Firebase with ID:', questionId);
    }

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(questionText)}`;
    console.log('Generated OG Image URL:', ogImageUrl);

    // Return HTML with Farcaster frame metadata
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Would You Rather</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${options[0]}" />
          <meta property="fc:frame:button:2" content="${options[1]}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes?questionId=${questionId}&fid=${fid}" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${questionText}</p>
        </body>
      </html>
    `;

    console.log('Sending HTML response with frame metadata');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

// Fetch a random question from the Would You Rather API
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
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

// Split the question text into two options
function generateOptions(question) {
  const parts = question.split(' or ');
  const option1 = parts[0].replace('Would you rather ', '').trim();
  const option2 = parts[1].replace(/[?.!]$/, '').trim();

  return [option1, option2];
}
