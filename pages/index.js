import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const [questionId, setQuestionId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof fc !== 'undefined') {
      fc.untrusted().then((userData) => {
        const fid = userData.fid;

        document.querySelectorAll(".voteButton").forEach((button) => {
          button.addEventListener("click", (event) => {
            const selectedOption = event.target.dataset.option;

            if (questionId && fid) {
              fetch('/api/updateVotes', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  questionId: questionId,
                  fid: fid,
                  option: selectedOption,
                }),
              });
            } else {
              console.error('Missing questionId or FID');
            }
          });
        });
      });
    }
  }, [questionId]);

  const displayQuestion = async () => {
    const response = await fetch('/api/playWouldYouRather', {
      method: 'POST',
    });
    const data = await response.json();
    setQuestionId(data.questionId);
  };

  useEffect(() => {
    displayQuestion();
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://would-you-rather-gamma.vercel.app';
  const imageUrl = `${baseUrl}/wouldrather.png`;
  const playUrl = `${baseUrl}/api/playWouldYouRather`;
  
  const shareText = encodeURIComponent('Play the Would You Rather game!\n\nFrame by @aaronv.eth');
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`;

  console.log('Base URL:', baseUrl);
  console.log('Image URL:', imageUrl);

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