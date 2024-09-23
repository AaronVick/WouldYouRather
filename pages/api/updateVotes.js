import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc, increment } from 'firebase/firestore';

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

    if (!questionId || !fid || !option) {
      console.error('Missing parameters:', { questionId, fid, option });
      return new NextResponse('Missing parameters', { status: 400 });
    }

    const questionRef = doc(db, 'Questions', questionId);
    const questionDoc = await getDoc(questionRef);

    if (!questionDoc.exists()) {
      console.error('Question not found:', questionId);
      return new NextResponse('Question not found', { status: 404 });
    }

    const updateField = option === 'optionOne' ? 'optionOneVotes' : 'optionTwoVotes';

    await updateDoc(questionRef, {
      [updateField]: increment(1),
      totalVotes: increment(1),
    });

    const userRef = doc(db, 'UserResponses', fid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        answeredQuestions: {
          [questionId]: option
        }
      });
    } else {
      await updateDoc(userRef, {
        [`answeredQuestions.${questionId}`]: option,
      });
    }

    const nextQuestion = await fetchNextQuestion();
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
