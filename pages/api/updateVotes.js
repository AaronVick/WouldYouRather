export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { fid, response } = await req.json();

    // Log the vote (you can implement a separate serverless function to handle Firebase operations)
    console.log(`User ${fid} voted: ${response}`);

    // Fetch a new question for the next frame
    const newQuestion = await fetchNewQuestion();

    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?question=${encodeURIComponent(newQuestion)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="Option 1" />
          <meta property="fc:frame:button:2" content="Option 2" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${newQuestion}</p>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in updateVotes:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function fetchNewQuestion() {
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
  return data[0].question;
}