import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  Cake,
  Gift,
  Heart,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  PartyPopper,
  X,
} from "lucide-react";

import {
  birthday,
  photos,
  letters,
  fortunes,
  gifts,
} from "./data";

type Section =
  | "intro"
  | "balloons"
  | "cake"
  | "gifts"
  | "letters"
  | "memories"
  | "fortune"
  | "final";

type BalloonOutcome =
  | "pop"
  | "photo"
  | "fly"
  | "message"
  | "fake";

type Balloon = {
  id: number;
  left: number;
  top: number;
  color: string;
  delay: number;
  outcome: BalloonOutcome;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const balloonColors = [
  "pink",
  "blue",
  "yellow",
  "lavender",
  "peach",
  "mint",
];

const balloonMessages = [
  "You're cute. That's it. That's the message.",
  "Birthday luck +100.",
  "Someone owes you cake.",
  "Today you are legally allowed to do nothing.",
  "Plot twist: you're everyone's favorite.",
  "You deserve a really good year.",
];

function App() {
  const [section, setSection] = useState<Section>("intro");

  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([]);
  const [balloonResults, setBalloonResults] = useState<
    Record<number, string>
  >({});
  const [flyingBalloons, setFlyingBalloons] = useState<number[]>([]);

  const [cakeStep, setCakeStep] = useState(0);
  const [wishMade, setWishMade] = useState(false);

  const [selectedGift, setSelectedGift] = useState<number | null>(
    null
  );

  const [openedLetters, setOpenedLetters] = useState<number[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<number | null>(
    null
  );

  const [fortune, setFortune] = useState<string | null>(null);
  const [rollingFortune, setRollingFortune] = useState(false);

  const [musicOn, setMusicOn] = useState(false);

  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);

  const [confetti, setConfetti] = useState<number[]>([]);

  const youtubeId = birthday.music.youtubeId;

  /*
    Explicit positions so the balloons are actually scattered
    instead of accidentally forming a line.
  */
  const balloons = useMemo<Balloon[]>(() => {
    const positions = [
      { left: 8, top: 10 },
      { left: 28, top: 25 },
      { left: 49, top: 8 },
      { left: 72, top: 20 },
      { left: 89, top: 11 },

      { left: 16, top: 51 },
      { left: 38, top: 43 },
      { left: 61, top: 56 },
      { left: 81, top: 46 },

      { left: 5, top: 76 },
      { left: 29, top: 69 },
      { left: 70, top: 75 },
    ];

    const outcomes: BalloonOutcome[] = [
      "pop",
      "fake",
      "fly",
      "message",
      "message",
      "pop",
      "message",
      "message",
      "fly",
      "pop",
      "fake",
      "message",
    ];

    return positions.map((position, index) => ({
      id: index,
      left: position.left,
      top: position.top,
      color: balloonColors[index % balloonColors.length],
      delay: (index % 5) * .75,
      outcome: outcomes[index],
    }));
  }, []);

  useEffect(() => {
    const existing = document.getElementById(
      "youtube-iframe-api"
    );

    if (!existing) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    const createPlayer = () => {
      if (!window.YT?.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(
        "youtube-player",
        {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            loop: 1,
            playlist: youtubeId,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              playerReadyRef.current = true;
              playerRef.current?.setVolume(70);
            },
          },
        }
      );
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    };

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, [youtubeId]);

  const triggerConfetti = (amount = 30) => {
    setConfetti(
      Array.from({ length: amount }, (_, index) => index)
    );

    window.setTimeout(() => {
      setConfetti([]);
    }, 2600);
  };

  const startMusic = () => {
    if (!playerReadyRef.current || !playerRef.current) return;

    try {
      playerRef.current.unMute();
      playerRef.current.setVolume(70);
      playerRef.current.playVideo();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  };

  const startAdventure = () => {
    startMusic();
    setSection("balloons");
  };

  const toggleMusic = () => {
    if (!playerReadyRef.current || !playerRef.current) {
      startMusic();
      return;
    }

    if (musicOn) {
      playerRef.current.pauseVideo();
      setMusicOn(false);
    } else {
      playerRef.current.unMute();
      playerRef.current.setVolume(70);
      playerRef.current.playVideo();
      setMusicOn(true);
    }
  };

  const popBalloon = (balloon: Balloon) => {
    if (
      poppedBalloons.includes(balloon.id) ||
      flyingBalloons.includes(balloon.id)
    ) {
      return;
    }

    if (balloon.outcome === "fly") {
      setFlyingBalloons((prev) => [
        ...prev,
        balloon.id,
      ]);

      window.setTimeout(() => {
        setBalloonResults((prev) => ({
          ...prev,
          [balloon.id]: "BYEEEEEE!",
        }));
      }, 200);

      return;
    }

    if (balloon.outcome === "fake") {
      setBalloonResults((prev) => ({
        ...prev,
        [balloon.id]: "NOPE. Nice try.",
      }));

      window.setTimeout(() => {
        setBalloonResults((prev) => {
          const copy = { ...prev };
          delete copy[balloon.id];
          return copy;
        });
      }, 1300);

      return;
    }

    setPoppedBalloons((prev) => [
      ...prev,
      balloon.id,
    ]);

    // if (balloon.outcome === "photo") {
    //   const photo =
    //     photos[balloon.id % photos.length];

    //   setBalloonResults((prev) => ({
    //     ...prev,
    //     [balloon.id]: `PHOTO: ${photo.caption}`,
    //   }));
    // }

    if (balloon.outcome === "message") {
      setBalloonResults((prev) => ({
        ...prev,
        [balloon.id]:
          balloonMessages[
            balloon.id % balloonMessages.length
          ],
      }));
    }

    if (balloon.outcome === "pop") {
      setBalloonResults((prev) => ({
        ...prev,
        [balloon.id]: "POP! +1 birthday point!",
      }));
    }

    triggerConfetti(12);
  };

  const balloonsDone =
    poppedBalloons.length +
      flyingBalloons.length >=
    8;

  const addCakeLayer = () => {
    setCakeStep((prev) =>
      Math.min(prev + 1, 3)
    );
  };

  const makeWish = () => {
    if (cakeStep < 3) return;

    setWishMade(true);
    triggerConfetti(50);
  };

  const openGift = (index: number) => {
    setSelectedGift(index);
    triggerConfetti(
      index === 1 ? 25 : 12
    );
  };

  const openLetter = (index: number) => {
    setSelectedLetter(index);

    setOpenedLetters((prev) =>
      prev.includes(index)
        ? prev
        : [...prev, index]
    );
  };

  const getFortune = () => {
    setRollingFortune(true);
    setFortune(null);

    window.setTimeout(() => {
      const result =
        fortunes[
          Math.floor(
            Math.random() * fortunes.length
          )
        ];

      setFortune(result);
      setRollingFortune(false);
      triggerConfetti(25);
    }, 1300);
  };

  const goTo = (next: Section) => {
    setSection(next);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 20);
  };

  return (
    <main className="birthday-world">
      <div
        id="youtube-player"
        className="youtube-player"
      />

      <button
        className="music-control"
        onClick={toggleMusic}
      >
        {musicOn ? (
          <Volume2 size={18} />
        ) : (
          <VolumeX size={18} />
        )}

        <span>
          {birthday.music.title} ·{" "}
          {birthday.music.artist}
        </span>

        <span className="equalizer">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>

      {/* ================= INTRO ================= */}

      {section === "intro" && (
        <section className="screen hero-screen">
          <div className="cloud cloud-one" />
          <div className="cloud cloud-two" />
          <div className="cloud cloud-three" />

          <div className="hero-stars">
            <Star />
            <Sparkles />
            <Star />
            <Sparkles />
          </div>

          <div className="hero-content">
            <div className="birthday-badge">
              <div className="badge-circle">
                <Cake size={32} />
              </div>

              <span>{birthday.date}</span>
            </div>

            <p className="eyebrow">
              A tiny birthday adventure
            </p>

            <h1>
              Someone has a
              <span> birthday.</span>
            </h1>

            <p className="hero-copy">
              {birthday.intro}
            </p>

            {/* FIXED HERO CAKE */}
            <div className="hero-cake-preview">
              <div className="cake-plate" />

              <div className="cake-body">
                <div className="cake-top" />

                <div className="cake-drip" />

                <div className="hero-candle">
                  <span className="hero-flame" />
                  <span className="hero-wick" />
                  <span className="hero-candle-body" />
                </div>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={startAdventure}
            >
              Start the birthday
              <Sparkles size={18} />
            </button>

            <p className="tiny-hint">
              music starts after you enter
            </p>
          </div>

          <div className="scroll-hint">
            <ArrowDown size={18} />
          </div>
        </section>
      )}

      {/* ================= BALLOONS ================= */}

      {section === "balloons" && (
        <section className="screen balloon-screen">
          <div className="section-heading">
            <p className="eyebrow">
              ROUND 01
            </p>

            <h2>Pop the balloons.</h2>

            <p>
              But careful... they don't all do
              the same thing.
            </p>
          </div>

          <div className="game-progress">
            <span>
              {poppedBalloons.length +
                flyingBalloons.length}
              /8
            </span>{" "}
            balloons collected
          </div>

          <div className="balloon-field">
            {balloons.map((balloon) => {
              const isPopped =
                poppedBalloons.includes(
                  balloon.id
                );

              const isFlying =
                flyingBalloons.includes(
                  balloon.id
                );

              return (
                <button
                  key={balloon.id}
                  className={[
                    "balloon",
                    `balloon-${balloon.color}`,
                    isPopped
                      ? "is-popped"
                      : "",
                    isFlying
                      ? "is-flying"
                      : "",
                    balloon.outcome === "fake"
                      ? "fake-balloon"
                      : "",
                  ].join(" ")}
                  style={
                    {
                      left: `${balloon.left}%`,
                      top: `${balloon.top}%`,
                      animationDelay: `${balloon.delay}s`,
                    } as React.CSSProperties
                  }
                  onClick={() =>
                    popBalloon(balloon)
                  }
                >
                  <span className="balloon-shine" />
                  <span className="balloon-knot" />
                  <span className="balloon-string" />

                  {balloonResults[
                    balloon.id
                  ] && (
                    <span className="balloon-message">
                      {
                        balloonResults[
                          balloon.id
                        ]
                      }
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="balloon-bottom">
            <p>
              {balloonsDone
                ? "Okayyyy you found enough. Birthday cake unlocked!"
                : "Some pop. Some escape. Some are hiding something."}
            </p>

            <button
              className="primary-button"
              disabled={!balloonsDone}
              onClick={() =>
                goTo("cake")
              }
            >
              Continue to cake
              <Cake size={18} />
            </button>
          </div>
        </section>
      )}

      {/* ================= CAKE ================= */}

      {section === "cake" && (
        <section className="screen cake-screen">
          <div className="section-heading">
            <p className="eyebrow">
              ROUND 02
            </p>

            <h2>
              Build the birthday cake.
            </h2>

            <p>
              One little step at a time. Then
              make a wish.
            </p>
          </div>

          <div className="cake-game">
            <div className="cake-glow" />

            <div className="big-cake">
              <div className="big-cake-plate" />

              <div className="cake-layer bottom-layer">
                <div className="cake-frosting">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              {cakeStep >= 1 && (
                <div className="cake-layer middle-layer">
                  <div className="cake-frosting">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {cakeStep >= 2 && (
                <div className="cake-layer top-layer">
                  <div className="cake-frosting">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {cakeStep >= 3 && (
                <div className="cake-candles">
                  {[0, 1, 2, 3].map(
                    (candle) => (
                      <div
                        className="cake-candle"
                        key={candle}
                      >
                        <div
                          className={`flame ${
                            wishMade
                              ? "extinguished"
                              : ""
                          }`}
                        />

                        <div className="candle-body" />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {!wishMade ? (
              <>
                <button
                  className="primary-button cake-action-button"
                  onClick={
                    cakeStep < 3
                      ? addCakeLayer
                      : makeWish
                  }
                >
                  {cakeStep < 3
                    ? cakeStep === 0
                      ? "Add cake"
                      : "Add another layer"
                    : "Make a wish"}

                  <Sparkles size={18} />
                </button>

                <p className="cake-instruction">
                  {cakeStep < 3
                    ? `Cake progress: ${cakeStep}/3`
                    : "The candles are ready. Make your wish!"}
                </p>
              </>
            ) : (
              <div className="wish-popup">
                <Sparkles size={24} />

                <strong>
                  Wish made.
                </strong>

                <span>
                  Okay. We won't tell anyone
                  what you wished for.
                </span>

                <button
                  className="secondary-button"
                  onClick={() =>
                    goTo("gifts")
                  }
                >
                  Open the gifts
                  <Gift size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= GIFTS ================= */}

      {section === "gifts" && (
        <section className="screen gifts-screen">
          <div className="section-heading">
            <p className="eyebrow">
              ROUND 03
            </p>

            <h2>Pick a gift.</h2>

            <p>
              No peeking. One of them is
              definitely suspicious.
            </p>
          </div>

          <div className="gift-stage">
            {gifts.map((gift, index) => (
              <button
                key={gift.title}
                className={`gift-box ${
                  selectedGift === index
                    ? "opened"
                    : ""
                }`}
                onClick={() =>
                  openGift(index)
                }
              >
                <div className="gift-shadow" />

                <div className="gift-body">
                  <div className="gift-ribbon vertical" />
                  <div className="gift-ribbon horizontal" />
                </div>

                <div className="gift-lid">
                  <div className="gift-ribbon vertical" />
                </div>

                <div className="gift-tag">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>

          {selectedGift !== null && (
            <div className="gift-result">
              <Sparkles size={20} />

              <p>
                {gifts[selectedGift].result}
              </p>

              <button
                className="secondary-button"
                onClick={() =>
                  goTo("letters")
                }
              >
                Continue
                <ArrowDown size={18} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* ================= LETTERS ================= */}

      {section === "letters" && (
        <section className="screen letters-screen">
          <div className="section-heading">
            <p className="eyebrow">
              ROUND 04
            </p>

            <h2>
              A wall of little letters.
            </h2>

            <p>
              Open whichever one is calling
              your name.
            </p>
          </div>

          <div className="letter-counter">
            {openedLetters.length}/
            {letters.length} opened
          </div>

          <div className="letter-wall">
            {letters.map(
              (letter, index) => (
                <button
                  key={index}
                  className={`envelope envelope-${
                    index % 4
                  }`}
                  onClick={() =>
                    openLetter(index)
                  }
                >
                  <div className="envelope-body">
                    <div className="envelope-flap" />

                    <Heart
                      className="envelope-heart"
                      size={20}
                    />

                    <span>
                      {letter.title}
                    </span>
                  </div>

                  <small>
                    {letter.label}
                  </small>

                  {openedLetters.includes(
                    index
                  ) && (
                    <span className="opened-mark">
                      ✓
                    </span>
                  )}
                </button>
              )
            )}
          </div>

          <button
            className="primary-button"
            onClick={() =>
              goTo("memories")
            }
          >
            See the memories
            <Heart size={18} />
          </button>
        </section>
      )}

      {/* ================= LETTER MODAL ================= */}

      {selectedLetter !== null && (
        <div className="modal-backdrop">
          <div className="letter-modal">
            <button
              className="modal-close"
              onClick={() =>
                setSelectedLetter(null)
              }
            >
              <X size={20} />
            </button>

            <div className="modal-icon">
              <Heart size={22} />
            </div>

            <p className="modal-label">
              {
                letters[selectedLetter]
                  .label
              }
            </p>

            <h3>
              {
                letters[selectedLetter]
                  .title
              }
            </h3>

            <div className="modal-content">
              {
                letters[selectedLetter]
                  .message
              }
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                setSelectedLetter(null)
              }
            >
              Keep exploring
            </button>
          </div>
        </div>
      )}

      {/* ================= MEMORIES ================= */}

      {section === "memories" && (
        <section className="screen memories-screen">
          <div className="section-heading">
            <p className="eyebrow">
              ROUND 05
            </p>

            <h2>
              Little memories.
            </h2>

            <p>
              A tiny collection of moments
              worth keeping.
            </p>
          </div>

          <div className="memory-grid">
            {photos.map(
              (photo, index) => (
                <figure
                  className="memory-card"
                  key={photo.src}
                >
                  <div className="memory-tape" />

                  <div className="memory-photo">
                    <img
                      src={photo.src}
                      alt={photo.caption}
                    />
                  </div>

                  <figcaption>
                    {photo.caption}
                  </figcaption>

                  <span className="memory-number">
                    0{index + 1}
                  </span>
                </figure>
              )
            )}
          </div>

          <div className="memory-video">
            <div className="memory-video-heading">
              <div>
                <p className="eyebrow">
                  MEMORY BOOTH
                </p>

                <h3>
                  And one little video.
                </h3>
              </div>

              <Sparkles size={26} />
            </div>

            <div className="video-frame">
              <video
                src="/videos/couple-video.mp4"
                controls
                playsInline
                preload="metadata"
              />
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              goTo("fortune")
            }
          >
            Tell me my birthday fortune
            <Star size={18} />
          </button>
        </section>
      )}

      {/* ================= FORTUNE ================= */}

      {section === "fortune" && (
        <section className="screen fortune-screen">
          <div className="fortune-stars">
            <Star />
            <Star />
            <Sparkles />
            <Star />
            <Sparkles />
          </div>

          <div className="section-heading">
            <p className="eyebrow">
              FINAL ROUND
            </p>

            <h2>
              Birthday fortune.
            </h2>

            <p>
              The birthday universe has
              something to say.
            </p>
          </div>

          <div
            className={`fortune-card ${
              rollingFortune
                ? "rolling"
                : ""
            }`}
          >
            <div className="fortune-icon">
              <Star size={28} />
            </div>

            <small>
              {rollingFortune
                ? "Consulting the universe..."
                : fortune
                  ? "Your fortune"
                  : "Tap below"}
            </small>

            <p>
              {rollingFortune
                ? "✨ ✦ ✧ ✦ ✨"
                : fortune ||
                  "Your birthday fortune is waiting."}
            </p>

            <div className="fortune-orbit">
              <span />
              <span />
              <span />
            </div>
          </div>

          <button
            className="primary-button"
            onClick={getFortune}
            disabled={rollingFortune}
          >
            {rollingFortune
              ? "Reading the stars..."
              : fortune
                ? "Read again"
                : "Reveal my fortune"}

            <Sparkles size={18} />
          </button>

          {fortune &&
            !rollingFortune && (
              <button
                className="secondary-button"
                onClick={() =>
                  goTo("final")
                }
              >
                Finish the birthday
                <PartyPopper size={18} />
              </button>
            )}
        </section>
      )}

      {/* ================= FINAL ================= */}

      {section === "final" && (
        <section className="screen final-screen">
          <div className="party-lights">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="final-balloons">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="final-content">
            <p className="eyebrow">
              YOU MADE IT
            </p>

            <div className="final-reactions">
              <img
                src="/element-1.png"
                alt="Funny birthday reaction"
                className="reaction reaction-funny"
              />

              <div className="final-heart">
                <Heart
                  size={40}
                  fill="currentColor"
                />
              </div>

              <img
                src="/element-2.png"
                alt="Happy birthday reaction"
                className="reaction reaction-happy"
              />
            </div>

            <PartyPopper
              className="party-icon"
              size={42}
            />

            <h1>
              Happy Birthday,
              <span>
                {" "}
                {birthday.name}!
              </span>
            </h1>

            <p className="final-message">
              {birthday.finalMessage}
            </p>

            <div className="final-letter">
              <Sparkles size={20} />
              <p>
                {birthday.letter}
              </p>
            </div>

            <div className="party-complete">
              <span>cake</span>
              <span>gifts</span>
              <span>letters</span>
              <span>memories</span>
              <span>luck</span>
            </div>
          </div>

          <button
            className="secondary-button restart-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Replay birthday
          </button>
        </section>
      )}

      {confetti.map((item) => (
        <span
          className="confetti-piece"
          key={item}
          style={
            {
              "--confetti-x": `${Math.random() * 100}vw`,
              "--confetti-delay": `${Math.random() * 0.3}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <footer className="site-footer">
        made with a little too much birthday
        energy ♡
      </footer>
    </main>
  );
}

export default App;