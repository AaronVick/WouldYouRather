import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question');

    if (!question) {
      throw new Error('Question not provided');
    }

    // Generate two options from the question
    const options = generateOptions(question);

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
            Would You Rather
          </div>
          <div style={{ fontSize: '32px', textAlign: 'center', maxWidth: '80%', wordWrap: 'break-word' }}>
            {question}
          </div>
          <div style={{ fontSize: '28px', marginTop: '20px' }}>
            1. {options[0]}
          </div>
          <div style={{ fontSize: '28px', marginTop: '10px' }}>
            2. {options[1]}
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

function generateOptions(question) {
  // Split the question at "or"
  const parts = question.split(" or ");
  
  // Remove "Would you rather " from the first part
  const option1 = parts[0].replace("Would you rather ", "").trim();
  
  // Remove any trailing punctuation from the second part
  const option2 = parts[1].replace(/[?.!]$/, "").trim();
  
  return [option1, option2];
}