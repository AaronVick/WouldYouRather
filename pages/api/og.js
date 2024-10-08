import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question');

    if (!question) {
      return new Response('Missing question parameter', { status: 400 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            color: 'black',
            background: 'white',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1>Would You Rather</h1>
          <p>{question}</p>
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