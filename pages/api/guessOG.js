import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const question = searchParams.get('question');

  if (!question) {
    return new Response('Question not provided', { status: 400 });
  }

  try {
    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ogImage?question=${encodeURIComponent(question)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="Option 1" />
          <meta property="fc:frame:button:2" content="Option 2" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${question}</p>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in guessOG:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}