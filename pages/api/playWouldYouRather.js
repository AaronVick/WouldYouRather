import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  console.log('Received request method:', req.method);

  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    console.log('Fetching question...');
    const question = await fetchQuestion();
    console.log('Fetched question:', question);

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?questionId=${question.id}`;
    console.log('OG Image URL:', ogImageUrl);

    const html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${question.data.optionOne}" />
          <meta property="fc:frame:button:2" content="${question.data.optionTwo}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes?questionId=${question.id}" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${question.data.question}</p>
          <button>${question.data.optionOne}</button>
          <button>${question.data.optionTwo}</button>
        </body>
      </html>
    `;

    console.log('Sending HTML response');
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function fetchQuestion() {
  console.log('Fetching question from API...');
  const response = await fetch('https://would-you-rather.p.rapidapi.com/wyr/random', {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('API response:', data);
  return data;
}