import { db } from '../../lib/firebase';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { questionId } = req.query;

    const questionDoc = await db.collection('Questions').doc(questionId).get();
    if (!questionDoc.exists) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const questionData = questionDoc.data();
    res.status(200).json(questionData);
  } catch (error) {
    console.error('Error fetching question data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}