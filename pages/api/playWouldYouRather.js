import { ImageResponse } from '@vercel/og';
import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const options = {
    method: 'GET',
    hostname: 'would-you-rather.p.rapidapi.com',
    port: null,
    path: '/wyr/random',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey, // Use Vercel environment variable for the API key
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
    }
  };

  const reqAPI = https.request(options, function (resAPI) {
    const chunks = [];

    resAPI.on('data', function (chunk) {
      chunks.push(chunk);
    });

    resAPI.on('end', function () {
      const body = Buffer.concat(chunks).toString();
      const question = JSON.parse(body);

      const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?questionId=${question.id}`;

      // Respond with the Farcaster frame meta tags
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(`
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${ogImageUrl}" />
            <meta property="fc:frame:button:1" content="${question.data.optionOne}" />
            <meta property="fc:frame:button:2" content="${question.data.optionTwo}" />
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes?questionId=${question.id}" />
          </head>
        </html>
      `);
    });
  });

  reqAPI.on('error', function (error) {
    res.status(500).json({ error: 'Error fetching question' });
  });

  reqAPI.end();
}
