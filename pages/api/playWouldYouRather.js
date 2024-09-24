export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { question, option1, option2 } = await fetchNewQuestion();
    
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error('NEXT_PUBLIC_BASE_URL is not set');
    }

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(question)}`;

    console.log('Generated OG Image URL:', ogImageUrl);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${option1}" />
          <meta property="fc:frame:button:2" content="${option2}" />
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
    console.error('Error in playWouldYouRather:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

async function fetchNewQuestion() {
  if (!process.env.XRapidAPIKey) {
    throw new Error('XRapidAPIKey is not set');
  }

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
  const questionData = data[0];
  
  return {
    question: questionData.question,
    option1: questionData.option_1,
    option2: questionData.option_2
  };
}