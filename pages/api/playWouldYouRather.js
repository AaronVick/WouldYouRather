import { db } from './firebaseAdmin';

export default async function handler(req, res) {
  const { fid } = req.body;

  try {
    // Fetch questions from Firebase
    const questionsRef = db.collection('Questions');
    let questionSnap;

    // Check if the user has answered before
    const userResponseRef = db.collection('UserResponses').doc(fid);
    const userResponseSnap = await userResponseRef.get();

    if (userResponseSnap.exists) {
      const answeredQuestions = userResponseSnap.data().responses.map((r) => r.questionId);
      questionSnap = await questionsRef
        .where(admin.firestore.FieldPath.documentId(), 'not-in', answeredQuestions)
        .limit(1)
        .get();
    } else {
      questionSnap = await questionsRef.limit(1).get();
    }

    if (questionSnap.empty) {
      return res.status(404).json({ error: 'No questions available' });
    }

    const questionData = questionSnap.docs[0].data();

    res.status(200).json({ question: questionData.questionText });
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
