import { db, FieldValue } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  console.log('updateVotes handler called');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { questionId, option1, option2 } = req.query;
    const { untrustedData } = req.body;
    const fid = untrustedData?.fid;
    const buttonIndex = untrustedData?.buttonIndex;

    console.log('Received data:', { questionId, option1, option2, fid, buttonIndex });

    if (!fid || !questionId || !option1 || !option2 || !buttonIndex) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const selectedOption = buttonIndex === 1 ? 'option1' : 'option2';

    // Update question votes
    const questionRef = db.collection('Questions').doc(questionId);
    await questionRef.update({
      [`${selectedOption}Votes`]: FieldValue.increment(1),
      totalVotes: FieldValue.increment(1)
    });

    // Record the user's vote
    await db.collection('UserResponses').doc(fid.toString()).set({
      [questionId]: selectedOption
    }, { merge: true });

    // Fetch updated question data
    const updatedQuestion = await questionRef.get();
    const questionData = updatedQuestion.data();

    if (!questionData) {
      throw new Error('Failed to fetch updated question data');
    }

    console.log('Updated question data:', questionData);

    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/resultOG?questionId=${questionId}&t=${Date.now()}`;

    console.log('Generated image URL:', imageUrl);

    // Generate the review HTML
    const reviewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="Play Again" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/playWouldYouRather" />
        </head>
        <body>
          <h1>Results</h1>
          <p>${questionData.question}</p>
          <p>${questionData.option1}: ${((questionData.option1Votes / questionData.totalVotes) * 100).toFixed(1)}%</p>
          <p>${questionData.option2}: ${((questionData.option2Votes / questionData.totalVotes) * 100).toFixed(1)}%</p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(reviewHtml);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error in updateVotes:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}