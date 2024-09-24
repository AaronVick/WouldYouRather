import { db } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { questionId, question, option1, option2 } = req.body;

    if (!questionId || !question || !option1 || !option2) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    await db.collection('Questions').doc(questionId).set({
      question,
      option1,
      option2,
      option1Votes: 0,
      option2Votes: 0,
      totalVotes: 0,
      createdAt: new Date()
    });

    res.status(200).json({ success: true, message: 'Question stored successfully' });
  } catch (error) {
    console.error('Error storing question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}