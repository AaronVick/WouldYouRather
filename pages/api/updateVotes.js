import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  const { questionId, fid, option } = req.body; // expecting questionId, fid, option from request

  // Update vote count in Questions collection
  const questionRef = doc(db, 'Questions', questionId);
  const updateField = option === 'optionOne' ? 'optionOneVotes' : 'optionTwoVotes';
  
  await updateDoc(questionRef, {
    [updateField]: increment(1),
    totalVotes: increment(1),
  });

  // Update user's response in UserResponses collection
  const userRef = doc(db, 'UserResponses', fid);
  await updateDoc(userRef, {
    [`answeredQuestions.${questionId}`]: option,
  });

  res.status(200).json({ success: true });
}
