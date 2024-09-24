import { db } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fid, questionId, response } = req.body;

    if (!fid || !questionId || !response) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Record the vote in Firebase
    await db.collection('UserResponses').doc(fid.toString()).set({
      [questionId]: response
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