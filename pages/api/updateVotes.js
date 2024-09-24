import { db } from './firebaseAdmin';
import { doc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';

export default async function handler(req) {
  const { questionId, fid, option } = await req.json();

  try {
    const questionRef = doc(db, 'Questions', questionId);
    const voteField = option === 'optionOne' ? 'optionOneVotes' : 'optionTwoVotes';

    // Update vote count
    await updateDoc(questionRef, {
      [voteField]: increment(1),
      totalVotes: increment(1),
    });

    // Log user response
    await addDoc(collection(db, 'UserResponses'), {
      fid,
      questionID: questionId,
      response: option,
    });

    return new Response(JSON.stringify({ message: 'Vote recorded successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error updating votes:', error);
    return new Response('Error recording vote', { status: 500 });
  }
}
