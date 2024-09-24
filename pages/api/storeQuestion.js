import { db } from './firebase';

export async function storeQuestionInFirebase(questionId, question, option1, option2) {
  try {
    await db.collection('Questions').doc(questionId).set({
      question,
      option1,
      option2,
      option1Votes: 0,
      option2Votes: 0,
      totalVotes: 0,
      createdAt: new Date()
    });
    console.log('Question stored successfully:', questionId);
  } catch (error) {
    console.error('Error storing question in Firebase:', error);
    throw error;
  }
}