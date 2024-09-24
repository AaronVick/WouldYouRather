import { db } from './firebaseAdmin';

export default async function handler(req, res) {
  const { question } = req.query;

  try {
    // Check if the question exists in Firebase
    const questionRef = db.collection('Questions').where('questionText', '==', question);
    const questionSnap = await questionRef.get();

    let questionData;

    if (!questionSnap.empty) {
      questionData = questionSnap.docs[0].data();
    } else {
      // If not, use the question passed from the API
      questionData = {
        questionText: question,
        optionOneText: 'First Option',
        optionTwoText: 'Second Option',
        totalVotes: 0,
      };
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ogImage?question=${encodeURIComponent(questionData.questionText)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="${questionData.optionOneText}" />
          <meta property="fc:frame:button:2" content="${questionData.optionTwoText}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${questionData.questionText}</p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in guessOG:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
