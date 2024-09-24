import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question');

    if (!question) {
      console.error('Missing question parameter');
      return new Response('Missing question parameter', { status: 400 });
    }

    console.log('Generating image for question:', question);

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
          }}
        >
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            Would You Rather
          </div>
          <div style={{ fontSize: '36px', textAlign: 'center', maxWidth: '80%', wordWrap: 'break-word' }}>
            {question}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('Error in guessOG:', error);
    return new Response(`Error generating image: ${error.message}`, { status: 500 });
  }
}