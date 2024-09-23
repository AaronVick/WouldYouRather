import { ImageResponse } from '@vercel/og';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    const questionDoc = await getDoc(doc(db, 'Questions', questionId));
    if (!questionDoc.exists()) {
      throw new Error('Question not found');
    }

    const questionData = questionDoc.data();
    const optionOnePercent = (questionData.optionOneVotes / questionData.totalVotes) * 100;
    const optionTwoPercent = (questionData.optionTwoVotes / questionData.totalVotes) * 100;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1E1E1E',
            color: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FF5733', marginBottom: '20px' }}>
            Would You Rather Poll Results
          </div>
          <div style={{ fontSize: '32px', textAlign: 'center', maxWidth: '80%', wordWrap: 'break-word' }}>
            {questionData.text}
          </div>
          <div style={{ fontSize: '28px', marginTop: '20px' }}>
            {questionData.optionOneText}: {optionOnePercent.toFixed(1)}%
          </div>
          <div style={{ fontSize: '28px', marginTop: '10px' }}>
            {questionData.optionTwoText}: {optionTwoPercent.toFixed(1)}%
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
