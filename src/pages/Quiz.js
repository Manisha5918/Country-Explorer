import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Quiz() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState("START"); // START, PLAYING, FINISHED
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answersLog, setAnswersLog] = useState([]); // tracks correct/incorrect details for scoreboard summary

  const timerRef = useRef(null);

  // Load countries dataset on mount
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/countries.json")
      .then((res) => res.json())
      .then((data) => {
        const countryArray = Object.values(data);
        const mapped = countryArray.map((c) => {
          const nameStr = c.name || "Unknown";
          const flagUrl = c.alpha2Code ? (c.alpha2Code.toLowerCase() === "ee" ? "https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/ee.png" : `https://flagcdn.com/w320/${c.alpha2Code.toLowerCase()}.png`) : "";
          const capitalText = Array.isArray(c.capital) ? c.capital[0] : (c.capital || "N/A");
          
          return {
            name: nameStr,
            cca3: c.alpha3Code || "",
            capital: capitalText,
            region: c.region || "World",
            population: c.population || 0,
            flag: flagUrl,
          };
        }).filter((c) => c.name !== "Unknown" && c.capital !== "N/A" && c.flag !== "");

        setCountries(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Quiz API load error:", err);
        setLoading(false);
      });
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState === "PLAYING" && !showFeedback) {
      setTimeLeft(15);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentIndex, showFeedback]);

  // Generate 10 randomized questions
  const startNewGame = () => {
    if (countries.length < 10) return;

    // Helper to pick random elements
    const getRandomSample = (arr, num) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    const selectedBase = getRandomSample(countries, 10);
    const generatedQuestions = selectedBase.map((country, index) => {
      // 4 quiz styles cycling or randomizing
      const type = index % 4; 
      let questionText = "";
      let correctAnswer = "";
      let options = [];
      let flagImage = null;

      if (type === 0) {
        // Capital Lookup
        questionText = `What is the capital city of ${country.name}?`;
        correctAnswer = country.capital;
        const fallbackOptions = getRandomSample(
          countries.filter((c) => c.name !== country.name),
          3
        ).map((c) => c.capital);
        options = [correctAnswer, ...fallbackOptions];
      } else if (type === 1) {
        // Flag Identification
        questionText = "Which country's flag is shown below?";
        correctAnswer = country.name;
        flagImage = country.flag;
        const fallbackOptions = getRandomSample(
          countries.filter((c) => c.name !== country.name),
          3
        ).map((c) => c.name);
        options = [correctAnswer, ...fallbackOptions];
      } else if (type === 2) {
        // Region location
        questionText = `In which geographic region is ${country.name} situated?`;
        correctAnswer = country.region;
        const regionsSet = Array.from(new Set(countries.map((c) => c.region))).filter((r) => r !== correctAnswer);
        const fallbackOptions = getRandomSample(regionsSet, 3);
        options = [correctAnswer, ...fallbackOptions];
      } else {
        // Population size comparison
        questionText = "Which of these countries has the LARGEST population?";
        const competitors = getRandomSample(
          countries.filter((c) => c.name !== country.name),
          3
        );
        const group = [country, ...competitors];
        // Find maximum population
        const winner = [...group].sort((a, b) => b.population - a.population)[0];
        correctAnswer = winner.name;
        options = group.map((g) => g.name);
      }

      // Shuffle options
      options = options.sort(() => 0.5 - Math.random());

      return {
        questionText,
        correctAnswer,
        options,
        flagImage,
        countryName: country.name,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswersLog([]);
    setGameState("PLAYING");
  };

  const handleAnswerSelect = (option) => {
    if (showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(option);
    setShowFeedback(true);

    const correct = option === questions[currentIndex].correctAnswer;
    if (correct) {
      setScore((prev) => prev + 1);
    }

    setAnswersLog((prev) => [
      ...prev,
      {
        question: questions[currentIndex].questionText,
        correctAnswer: questions[currentIndex].correctAnswer,
        selectedAnswer: option,
        isCorrect: correct,
        timeout: false,
      },
    ]);
  };

  const handleTimeout = () => {
    setSelectedAnswer(null);
    setShowFeedback(true);
    setAnswersLog((prev) => [
      ...prev,
      {
        question: questions[currentIndex].questionText,
        correctAnswer: questions[currentIndex].correctAnswer,
        selectedAnswer: null,
        isCorrect: false,
        timeout: true,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < 9) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGameState("FINISHED");
    }
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <h1 className="loading">Loading Trivia Game...</h1>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-card">
        {gameState === "START" && (
          <div className="quiz-start-screen">
            <div className="quiz-icon">🏆</div>
            <h1>Global Geography Trivia</h1>
            <p>
              Test your knowledge of world flags, capital cities, populations, and continental regions! Answer 10 randomized cards. You have 15 seconds per card.
            </p>
            <button className="quiz-start-btn" onClick={startNewGame}>
              Start Quiz
            </button>
            <div className="quiz-actions">
              <Link to="/dashboard" className="quiz-back-btn">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {gameState === "PLAYING" && questions.length > 0 && (
          <div className="quiz-playing-screen">
            <div className="quiz-header">
              <span className="quiz-progress">
                Card <strong>{currentIndex + 1}</strong> of 10
              </span>
              <span className="quiz-score">
                Score: <strong>{score}</strong>
              </span>
            </div>

            {/* Timer visual progress bar */}
            <div className="quiz-timer-bar-wrapper">
              <div
                className={`quiz-timer-bar ${timeLeft <= 5 ? "timer-critical" : ""}`}
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              ></div>
            </div>

            <div className="quiz-timer-text">
              ⏱ <strong>{timeLeft}s</strong> remaining
            </div>

            <h2 className="quiz-question">{questions[currentIndex].questionText}</h2>

            {questions[currentIndex].flagImage && (
              <div className="quiz-flag-wrapper">
                <img
                  src={questions[currentIndex].flagImage}
                  alt="Quiz Flag Preview"
                  className="quiz-flag-preview"
                />
              </div>
            )}

            <div className="quiz-options-grid">
              {questions[currentIndex].options.map((option, idx) => {
                let btnClass = "quiz-option-btn";
                if (showFeedback) {
                  if (option === questions[currentIndex].correctAnswer) {
                    btnClass += " option-correct";
                  } else if (option === selectedAnswer) {
                    btnClass += " option-incorrect";
                  } else {
                    btnClass += " option-disabled";
                  }
                }

                return (
                  <button
                    key={idx}
                    className={btnClass}
                    disabled={showFeedback}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    {option || "N/A"}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="quiz-feedback-area">
                {selectedAnswer === null ? (
                  <p className="feedback-text text-incorrect">⏰ Time's Up!</p>
                ) : selectedAnswer === questions[currentIndex].correctAnswer ? (
                  <p className="feedback-text text-correct">🎉 Correct Answer!</p>
                ) : (
                  <p className="feedback-text text-incorrect">
                    ❌ Incorrect. The right answer was <strong>{questions[currentIndex].correctAnswer}</strong>.
                  </p>
                )}
                <button className="quiz-next-btn" onClick={handleNext}>
                  {currentIndex === 9 ? "Finish Quiz →" : "Next Card →"}
                </button>
              </div>
            )}
          </div>
        )}

        {gameState === "FINISHED" && (
          <div className="quiz-end-screen">
            <div className="quiz-medal">
              {score >= 8 ? "🥇" : score >= 5 ? "🥈" : "🥉"}
            </div>
            <h1>Round Completed!</h1>
            <h2 className="quiz-final-score">
              Your Score: <span className="score-badge">{score} / 10</span>
            </h2>
            <p className="quiz-final-evaluation">
              {score >= 8
                ? "Incredible Explorer! You have masterclass cartographic knowledge!"
                : score >= 5
                ? "Good job! You know your way around the globe."
                : "Keep exploring! The world is full of fascinating details to learn."}
            </p>

            <div className="quiz-actions-block">
              <button className="quiz-retry-btn" onClick={startNewGame}>
                Play Again 🔄
              </button>
              <Link to="/dashboard" className="quiz-dashboard-link">
                Dashboard Overview →
              </Link>
            </div>

            <div className="quiz-breakdown-section">
              <h3>Answer Breakdown</h3>
              <div className="quiz-breakdown-list">
                {answersLog.map((log, index) => (
                  <div key={index} className={`breakdown-row ${log.isCorrect ? "row-correct" : "row-incorrect"}`}>
                    <div className="breakdown-q">
                      <strong>Card {index + 1}:</strong> {log.question}
                    </div>
                    <div className="breakdown-ans">
                      {log.timeout ? (
                        <span>⏰ Time out (Correct: <strong>{log.correctAnswer}</strong>)</span>
                      ) : (
                        <span>
                          Your Answer: <strong>{log.selectedAnswer || "None"}</strong>{" "}
                          {!log.isCorrect && (
                            <>
                              | Correct: <strong>{log.correctAnswer}</strong>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
