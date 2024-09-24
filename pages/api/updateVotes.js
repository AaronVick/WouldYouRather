import { db } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fid, questionId, option } = req.body;

    if (!fid || !questionId || !option) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Record the vote in Firebase
    await db.collection('UserResponses').doc(fid).set({
      [questionId]: option
    }, { merge: true });

    // Update question votes
    const questionRef = db.collection('Questions').doc(questionId);
    await questionRef.update({
      [`${option}Votes`]: db.FieldValue.increment(1),
      totalVotes: db.FieldValue.increment(1)
    });

    // Fetch updated question data
    const updatedQuestion = await questionRef.get();
    const questionData = updatedQuestion.data();

    // Calculate percentages
    const totalVotes = questionData.totalVotes;
    const option1Percent = (questionData.option1Votes / totalVotes) * 100;
    const option2Percent = (questionData.option2Votes / totalVotes) * 100;

    // Generate the review HTML
    const reviewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/resultOG?questionId=${questionId}" />
          <meta property="fc:frame:button:1" content="Play Again" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/playWouldYouRather" />
        </head>
        <body>
          <h1>Results</h1>
          <p>${questionData.question}</p>
          <p>${questionData.option1}: ${option1Percent.toFixed(1)}%</p>
          <p>${questionData.option2}: ${option2Percent.toFixed(1)}%</p>
        </body>
      </html>
    `;

    res.status(200).send(reviewHtml);
  } catch (error) {
    console.error('Error in updateVotes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}