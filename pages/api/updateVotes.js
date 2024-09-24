import { db } from './firebaseAdmin';

export default async function handler(req, res) {
  const { fid, questionId, response } = req.body;

  try {
    const questionRef = db.collection('Questions').doc(questionId);
    const questionSnap = await questionRef.get();

    if (!questionSnap.exists) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Log user response
    const responseRef = db.collection('UserResponses').doc(fid);
    await responseRef.set(
      {
        responses: admin.firestore.FieldValue.arrayUnion({
          questionId,
          response,
        }),
      },
      { merge: true }
    );

    // Update vote counts
    const voteField = response === 'OptionOne' ? 'optionOneVotes' : 'optionTwoVotes';
    await questionRef.update({
      [voteField]: admin.firestore.FieldValue.increment(1),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in updateVotes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
