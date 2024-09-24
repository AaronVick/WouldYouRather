import { db } from './firebaseAdmin';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { questionId, option } = await req.json();

    const questionRef = db.collection('Questions').doc(questionId);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      throw new Error('Question not found');
    }

    const questionData = questionDoc.data();

    if (option === 'optionOne') {
      questionData.optionOneVotes += 1;
    } else if (option === 'optionTwo') {
      questionData.optionTwoVotes += 1;
    }

    questionData.totalVotes += 1;
    await questionRef.set(questionData);

    return new Response('Vote recorded successfully', { status: 200 });
  } catch (error) {
    return new Response(`Error processing vote: ${error.message}`, { status: 500 });
  }
}
