import { ImageResponse } from '@vercel/og';
import { db } from './firebaseAdmin';
import { getDoc, doc } from 'firebase/firestore';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    const questionDoc = await getDoc(doc(db, 'Questions', questionId));
    if (!questionDoc.exists()) throw new Error('Question not found');

    const questionData = questionDoc.data();
    const optionOnePercent = (questionData.optionOneVotes / questionData.totalVotes) * 100;
    const optionTwoPercent = (questionData.optionTwoVotes / questionData.totalVotes) * 100;

    return new ImageResponse(
      (
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', padding: '40px', fontSize: '24px' }}>
          <h1>Would You Rather?</h1>
          <p>{questionData.text}</p>
          <div>{questionData.optionOneText}: {optionOnePercent.toFixed(1)}%</div>
          <div>{questionData.optionTwoText}: {optionTwoPercent.toFixed(1)}%</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
