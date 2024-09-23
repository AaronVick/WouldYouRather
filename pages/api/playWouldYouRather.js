import { ImageResponse } from '@vercel/og';
import https from 'https';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const question = await fetchQuestion();
    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?questionId=${question.id}`;

    const html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${question.data.optionOne}" />
          <meta property="fc:frame:button:2" content="${question.data.optionTwo}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes?questionId=${question.id}" />
        </head>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function fetchQuestion() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'would-you-rather.p.rapidapi.com',
      port: null,
      path: '/wyr/random',
      headers: {
        'x-rapidapi-key': process.env.XRapidAPIKey,
        'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const question = JSON.parse(data);
          resolve(question);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}