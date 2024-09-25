import { ImageResponse } from '@vercel/og';
import { db } from '../../lib/firebase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  console.log('resultOG handler called');
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    console.log('Received questionId:', questionId);

    if (!questionId) {
      console.error('Missing questionId parameter');
      return new Response(JSON.stringify({ error: 'Missing questionId parameter' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const questionDoc = await db.collection('Questions').doc(questionId).get();
    if (!questionDoc.exists) {
      console.error('Question not found:', questionId);
      return new Response(JSON.stringify({ error: 'Question not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const questionData = questionDoc.data();
    console.log('Question data:', questionData);

    const totalVotes = questionData.totalVotes || 1; // Prevent division by zero
    const option1Percent = ((questionData.option1Votes || 0) / totalVotes) * 100;
    const option2Percent = ((questionData.option2Votes || 0) / totalVotes) * 100;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '40px',
          }}
        >
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
            Results
          </div>
          <div style={{ fontSize: '36px', textAlign: 'center', maxWidth: '80%', wordWrap: 'break-word', marginBottom: '40px' }}>
            {questionData.question}
          </div>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{questionData.option1}: {option1Percent.toFixed(1)}%</div>
              <div style={{ width: '100%', height: '30px', backgroundColor: '#e0e0e0' }}>
                <div style={{ width: `${option1Percent}%`, height: '100%', backgroundColor: '#4CAF50' }}></div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{questionData.option2}: {option2Percent.toFixed(1)}%</div>
              <div style={{ width: '100%', height: '30px', backgroundColor: '#e0e0e0' }}>
                <div style={{ width: `${option2Percent}%`, height: '100%', backgroundColor: '#2196F3' }}></div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error in resultOG:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}