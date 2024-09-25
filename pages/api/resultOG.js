import { ImageResponse } from '@vercel/og';
import { db } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  console.log('resultOG handler called');
  try {
    const { questionId } = req.query;
    console.log('Received questionId:', questionId);

    if (!questionId) {
      console.error('Missing questionId parameter');
      return res.status(400).json({ error: 'Missing questionId parameter' });
    }

    const questionDoc = await db.collection('Questions').doc(questionId).get();
    if (!questionDoc.exists) {
      console.error('Question not found:', questionId);
      return res.status(404).json({ error: 'Question not found' });
    }

    const questionData = questionDoc.data();
    console.log('Question data:', questionData);

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

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    
    // Send the response
    imageResponse.body.pipe(res);
    console.log('Image response sent successfully');

  } catch (error) {
    console.error('Error in resultOG:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message, stack: error.stack });
  }
}