import { NextResponse } from 'next/server';
import { db } from './firebaseAdmin';
import { collection, doc, setDoc, getDocs, addDoc, query, where } from 'firebase/firestore';

export const config = {
  runtime: 'edge',
};

async function fetchQuestionFromAPI() {
  const url = 'https://would-you-rather.p.rapidapi.com/wyr/random';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
    }
  };

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Error fetching from API: ${response.status}`);
  const question = await response.json();
  return question[0];  // Assuming the API returns an array
}

export default async function handler(req) {
  try {
    const { fid } = req.headers;
    if (!fid) throw new Error('Farcaster FID is required.');

    let questionDoc;
    let questionData;

    // Check if the user has already answered any question
    const userResponsesRef = collection(db, 'UserResponses');
    const userQuery = query(userResponsesRef, where('FID', '==', fid));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      // No responses from this user, fetch a new question from API
      questionData = await fetchQuestionFromAPI();
    } else {
      // Get all questions that user hasn't answered
      const questionsRef = collection(db, 'Questions');
      const questionQuery = query(questionsRef);
      const questionSnapshot = await getDocs(questionQuery);

      questionSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.usersAnswered.includes(fid)) {
          questionDoc = doc;
          questionData = doc.data();
        }
      });

      if (!questionDoc) {
        questionData = await fetchQuestionFromAPI();
      }
    }

    // If it's a new question from the API, store it in Firebase
    if (!questionDoc) {
      const newQuestionRef = await addDoc(collection(db, 'Questions'), {
        text: questionData.question,
        optionOneText: questionData.optionOneText,
        optionTwoText: questionData.optionTwoText,
        optionOneVotes: 0,
        optionTwoVotes: 0,
        usersAnswered: [],
      });
      questionData.id = newQuestionRef.id;
    } else {
      questionData.id = questionDoc.id;
    }

    // Generate OG image URL
    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/guessOG?questionId=${questionData.id}`;

    // HTML response
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Would You Rather</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ogImageUrl}" />
          <meta property="fc:frame:button:1" content="${questionData.optionOneText}" />
          <meta property="fc:frame:button:2" content="${questionData.optionTwoText}" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/updateVotes" />
        </head>
        <body>
          <h1>Would You Rather</h1>
          <p>${questionData.text}</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in playWouldYouRather:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
