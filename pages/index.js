import Head from 'next/head';

export default function Home() {
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/wouldrather.png`;
  const playUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/playWouldYouRather`;

  const shareText = encodeURIComponent('Play the Would You Rather game!\n\nFrame by @aaronv.eth');
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

  fc.untrusted().then((userData) => {
    const fid = userData.fid; // Capture FID from untrusted data
    document.querySelectorAll(".voteButton").forEach((button) => {
      button.addEventListener("click", (event) => {
        const selectedOption = event.target.dataset.option; // Get selected option

        // Send POST request with FID and option
        fetch('/api/updateVotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: 'question_id',  // Replace dynamically
            fid: fid,  // Pass FID
            option: selectedOption,  // Pass selected option (optionOne or optionTwo)
          }),
        });
      });
    });
  });

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
        <button className="voteButton" data-option="optionOne">Play Game</button>
        <button onClick={() => window.open(shareLink)}>Share</button>
      </main>
    </div>
  );
}
