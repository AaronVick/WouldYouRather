import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    // Fetch question data from a new API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getQuestionData?questionId=${questionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch question data');
    }
    const questionData = await response.json();

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
            padding: '20px'
          }}
        >
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FF5733', marginBottom: '20px' }}>
            Would You Rather Poll Results
          </div>
          <div style={{ fontSize: '32px', textAlign: 'center', maxWidth: '80%', wordWrap: 'break-word' }}>
            {questionData.text}
          </div>
          
          {/* Option One */}
          <div style={{ fontSize: '28px', marginTop: '20px', width: '100%', maxWidth: '800px' }}>
            {questionData.optionOneText}: {optionOnePercent.toFixed(1)}%
            <div style={{ backgroundColor: '#FF5733', height: '25px', width: `${optionOnePercent}%`, marginTop: '10px' }}></div>
          </div>

          {/* Option Two */}
          <div style={{ fontSize: '28px', marginTop: '20px', width: '100%', maxWidth: '800px' }}>
            {questionData.optionTwoText}: {optionTwoPercent.toFixed(1)}%
            <div style={{ backgroundColor: '#3498db', height: '25px', width: `${optionTwoPercent}%`, marginTop: '10px' }}></div>
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