import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

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
  const { fid } = req.query; // assuming you're using fid as a user identifier
  const questionsRef = doc(db, 'Questions');
  
  // Fetch random question logic
  const questionSnapshot = await getDoc(questionsRef);
  if (!questionSnapshot.exists()) {
    return res.status(404).json({ error: 'No questions found' });
  }
  
  const questionData = questionSnapshot.data();
  
  // Get the user's answered questions to ensure no repeats
  const userDoc = await getDoc(doc(db, 'UserResponses', fid));
  const answeredQuestions = userDoc.exists() ? userDoc.data().answeredQuestions || {} : {};
  
  if (answeredQuestions[questionData.questionId]) {
    return res.status(400).json({ message: 'User already answered this question' });
  }

  res.status(200).json({
    questionId: questionData.questionId,
    questionText: questionData.text,
    optionOneText: questionData.optionOneText,
    optionTwoText: questionData.optionTwoText,
  });
}
