import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const [questionId, setQuestionId] = useState(null);  // State to store questionId

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof fc !== 'undefined') {
      // Fetch untrusted data (FID) from Farcaster frame
      fc.untrusted().then((userData) => {
        const fid = userData.fid;  // Capture the FID from untrusted data

        // Add event listeners to the voting buttons
        document.querySelectorAll(".voteButton").forEach((button) => {
          button.addEventListener("click", (event) => {
            const selectedOption = event.target.dataset.option;  // Get selected option (optionOne or optionTwo)

            // Ensure we have the questionId and fid before sending the request
            if (questionId && fid) {
              // Send POST request with FID, questionId, and selected option
              fetch('/api/updateVotes', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  questionId: questionId,  // Dynamically assigned questionId from Firebase
                  fid: fid,  // Farcaster FID
                  option: selectedOption,  // The selected option (optionOne or optionTwo)
                }),
              });
            } else {
              console.error('Missing questionId or FID');
            }
          });
        });
      });
    }
  }, [questionId]);  // Ensure this runs only when questionId is set

  // Simulate fetching a questionId after the question is displayed (from Firebase)
  const displayQuestion = async () => {
    // Fetch the question and questionId from Firebase
    const response = await fetch('/api/playWouldYouRather', {
      method: 'POST',
    });
    const data = await response.json();
    setQuestionId(data.questionId);  // Set the dynamic questionId in state
  };

  useEffect(() => {
    displayQuestion();  // Fetch question on page load
  }, []);

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/wouldrather.png`;
  const playUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/playWouldYouRather`;
  
  const shareText = encodeURIComponent('Play the Would You Rather game!\n\nFrame by @aaronv.eth');
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

  return (
    <div>
      <Head>
        <title>Would You Rather Game</title>
        <meta property="og:title" content="Would You Rather Game" />
        <meta property="og:image" content={imageUrl} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={imageUrl} />
        <meta property="fc:frame:button:1" content="Play Game" />
        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content={shareLink} />
        <meta property="fc:frame:post_url" content={playUrl} />
      </Head>
      <main>
        <h1>Welcome to Would You Rather!</h1>
        <p>Interact with the game on Farcaster!</p>
        <button className="voteButton" data-option="optionOne">Option One</button>
        <button className="voteButton" data-option="optionTwo">Option Two</button>
        <button onClick={() => window.open(shareLink)}>Share</button>
      </main>
    </div>
  );
}
