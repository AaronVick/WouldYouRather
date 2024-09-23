import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  console.log('guessOG handler called');
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question');

    console.log('Received question for image generation:', question);

    if (!question) {
      throw new Error('Question not provided');
    }

    // Generate two options from the question
    const options = generateOptions(question);

    console.log('Generated options:', options);

    const image = new ImageResponse(
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
            padding: '40px',
          }}
        >
          <div style={{ display: 'flex', fontSize: '72px', fontWeight: 'bold', color: '#4A90E2', marginBottom: '40px', textAlign: 'center' }}>
            Would You Rather
          </div>
          <div style={{ display: 'flex', fontSize: '44px', textAlign: 'center', maxWidth: '90%', wordWrap: 'break-word', marginBottom: '40px' }}>
            {question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', fontSize: '36px', textAlign: 'center', width: '100%', justifyContent: 'center' }}>
              1. {options[0]}
            </div>
            <div style={{ display: 'flex', fontSize: '36px', textAlign: 'center', width: '100%', justifyContent: 'center' }}>
              2. {options[1]}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    console.log('Image generated successfully');
    return image;
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(`Error generating image: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
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