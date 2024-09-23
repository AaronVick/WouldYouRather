import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  console.log('Received request method:', req.method);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    console.log('Fetching question...');
    const question = await fetchQuestion();
    console.log('Fetched question:', JSON.stringify(question));

    if (!question || !question.data) {
      throw new Error('Invalid question data received');
    }

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?questionId=${question.id}`;
    console.log('OG Image URL:', ogImageUrl);

    const shareText = encodeURIComponent(`I'm playing Would You Rather! My question: ${question.data.question}\n\nPlay now:`);
    const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Would You Rather</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${question.data.optionOne}" />
          <meta property="fc:frame:button:2" content="${question.data.optionTwo}" />
          <meta property="fc:frame:button:3" content="Share" />
          <meta property="fc:frame:button:3:action" content="link" />
          <meta property="fc:frame:button:3:target" content="${shareLink}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes?questionId=${question.id}" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${question.data.question}</p>
        </body>
      </html>
    `;

    console.log('Sending HTML response');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
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
  console.log('API response:', JSON.stringify(data));
  return data;
}