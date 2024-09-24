import { ImageResponse } from '@vercel/og';
import { db } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  try {
    const { questionId } = req.query;

    if (!questionId) {
      return new Response('Missing questionId parameter', { status: 400 });
    }

    const questionDoc = await db.collection('Questions').doc(questionId).get();
    if (!questionDoc.exists) {
      return new Response('Question not found', { status: 404 });
    }

    const questionData = questionDoc.data();
    const totalVotes = questionData.totalVotes || 1; // Prevent division by zero
    const option1Percent = ((questionData.option1Votes || 0) / totalVotes) * 100;
    const option2Percent = ((questionData.option2Votes || 0) / totalVotes) * 100;

    const imageContent = (
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
    );

    const imageResponse = new ImageResponse(imageContent, {
      width: 1200,
      height: 630,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.status(200).send(imageResponse);

  } catch (error) {
    console.error('Error in resultOG:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}