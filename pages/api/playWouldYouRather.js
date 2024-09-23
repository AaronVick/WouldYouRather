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
    const questionData = await fetchQuestion();
    console.log('Fetched question:', JSON.stringify(questionData));

    if (!questionData || !Array.isArray(questionData) || questionData.length === 0) {
      throw new Error('Invalid question data received');
    }

    const question = questionData[0];

    if (!question.question) {
      throw new Error('Question text is missing');
    }

    const options = generateOptions(question.question);

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(question.question)}`;
    console.log('Generated OG Image URL:', ogImageUrl);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Would You Rather</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${options[0]}" />
          <meta property="fc:frame:button:2" content="${options[1]}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes" />
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

function generateOptions(question) {
  const parts = question.split(" or ");
  const option1 = parts[0].replace("Would you rather ", "").trim();
  const option2 = parts[1].replace(/[?.!]$/, "").trim();
  
  return [option1, option2];
}
