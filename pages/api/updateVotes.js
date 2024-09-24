import { db, FieldValue } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { questionId, option1, option2 } = req.query;
    const { untrustedData } = req.body;
    const fid = untrustedData?.fid;
    const buttonIndex = untrustedData?.buttonIndex;

    if (!fid || !questionId || !option1 || !option2 || !buttonIndex) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const selectedOption = buttonIndex === 1 ? 'option1' : 'option2';

    // First, check if the question exists and create it if it doesn't
    const questionRef = db.collection('Questions').doc(questionId);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      // Question doesn't exist, create it
      await questionRef.set({
        question: `Would you rather ${option1} or ${option2}?`,
        option1,
        option2,
        option1Votes: 0,
        option2Votes: 0,
        totalVotes: 0,
        createdAt: FieldValue.serverTimestamp()
      });
    }

    // Update question votes
    await questionRef.update({
      [`${selectedOption}Votes`]: FieldValue.increment(1),
      totalVotes: FieldValue.increment(1)
    });

    // Now that we've ensured the question exists and updated its votes,
    // we can record the user's vote
    await db.collection('UserResponses').doc(fid.toString()).set({
      [questionId]: selectedOption
    }, { merge: true });

    // Fetch updated question data
    const updatedQuestion = await questionRef.get();
    const questionData = updatedQuestion.data();

    if (!questionData) {
      throw new Error('Failed to fetch updated question data');
    }

    // Calculate percentages
    const totalVotes = questionData.totalVotes || 1;  // Prevent division by zero
    const option1Percent = ((questionData.option1Votes || 0) / totalVotes) * 100;
    const option2Percent = ((questionData.option2Votes || 0) / totalVotes) * 100;

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
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}