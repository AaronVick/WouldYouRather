import { ImageResponse } from '@vercel/og';

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

    // Fetch question data from a separate API route
    const questionDataResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getQuestionData?questionId=${questionId}`);
    if (!questionDataResponse.ok) {
      throw new Error(`Failed to fetch question data: ${questionDataResponse.statusText}`);
    }
    const questionData = await questionDataResponse.json();

    console.log('Question data:', questionData);

    const totalVotes = questionData.totalVotes || 1; // Prevent division by zero
    const option1Percent = ((questionData.option1Votes || 0) / totalVotes) * 100;
    const option2Percent = ((questionData.option2Votes || 0) / totalVotes) * 100;

    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
          <h1 style={{
            fontSize: '48px',
            marginBottom: '20px',
            textAlign: 'center',
            display: 'block',
          }}>
            Results
          </h1>

          <p style={{
            fontSize: '36px',
            textAlign: 'center',
            marginBottom: '40px',
            display: 'block',
            maxWidth: '80%',
            wordWrap: 'break-word',
          }}>
            {questionData.question}
          </p>

          <div style={{
            width: '100%',
            maxWidth: '600px',
            display: 'block',
          }}>
            <p style={{
              fontSize: '24px',
              marginBottom: '10px',
              display: 'block',
            }}>
              {questionData.option1}: {option1Percent.toFixed(1)}%
            </p>
            <div style={{
              width: '100%',
              height: '30px',
              backgroundColor: '#e0e0e0',
              position: 'relative',
              display: 'block',
            }}>
              <div style={{
                width: `${option1Percent}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                position: 'absolute',
                top: 0,
                left: 0,
              }} />
            </div>

            <p style={{
              fontSize: '24px',
              marginTop: '20px',
              marginBottom: '10px',
              display: 'block',
            }}>
              {questionData.option2}: {option2Percent.toFixed(1)}%
            </p>
            <div style={{
              width: '100%',
              height: '30px',
              backgroundColor: '#e0e0e0',
              position: 'relative',
              display: 'block',
            }}>
              <div style={{
                width: `${option2Percent}%`,
                height: '100%',
                backgroundColor: '#2196F3',
                position: 'absolute',
                top: 0,
                left: 0,
              }} />
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
