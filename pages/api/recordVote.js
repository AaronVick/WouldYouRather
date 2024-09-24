import db from '../../firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fid, questionId, response } = req.body;

    // Record the vote in Firebase
    await db.collection('UserResponses').doc(fid).set({
      [`${questionId}`]: response
    }, { merge: true });

    // Update question votes
    await db.collection('Questions').doc(questionId).update({
      [`${response}Votes`]: db.FieldValue.increment(1),
      totalVotes: db.FieldValue.increment(1)
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in recordVote:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}