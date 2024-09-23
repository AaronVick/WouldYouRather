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
    console.log('Fetched question:', question);

    if (!question) {
      throw new Error('Invalid question data received');
    }

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?questionId=${question.id}`;
    console.log('OG Image URL:', ogImageUrl);

    const shareText = encodeURIComponent(`I'm playing Would You Rather! My question: ${question.question}\n\nPlay now:`);
    const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Would You Rather</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${question.option_1}" />
          <meta property="fc:frame:button:2" content="${question.option_2}" />
          <meta property="fc:frame:button:3" content="Share" />
          <meta property="fc:frame:button:3:action" content="link" />
          <meta property="fc:frame:button:3:target" content="${shareLink}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes?questionId=${question.id}" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${question.question}</p>
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
  const url = 'https://would-you-rather.p.rapidapi.com/wyr/random';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
    }
  };

  console.log('Fetching question from API...');
  console.log('API Key (last 4 chars):', process.env.XRapidAPIKey ? process.env.XRapidAPIKey.slice(-4) : 'Not set');

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error('API Response:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
}