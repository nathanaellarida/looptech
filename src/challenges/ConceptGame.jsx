import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CandyImg from '/images/Candy.png';
import Candy3Img from '/images/Candy3.png';

const ConceptGame = () => {
  const navigate = useNavigate();

  const questions = [
    {
      type: "multiple-choice",
      text: "Which statement best describes what a variable is in programming?",
      choices: [
        "A reserved keyword that performs a specific operation.",
        "A special type of data that cannot be changed.",
        "A name used to store data that can change while a program runs.",
        "A type of error that stops a program from running.",
      ],
      correctIndex: 2,
    },
    {
      type: "fill-in-blank",
      text: "Complete the line of code below to display a message “Hello, World!” in Python.",
      codeSnippet: "______ (\"Hello, World!\")",
      correctAnswer: "print",
    },
    {
      type: "drag-drop",
      text: "Drag the correct variable names to match the given values.",
      values: ["Juan", "12", "true"],
      options: ["name", "age", "isStudent"],
      correctMatches: {
        "Juan": "name",
        "12": "age",
        "true": "isStudent",
      },
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [dragMatches, setDragMatches] = useState({});
  const [availableOptions, setAvailableOptions] = useState(
    questions[2]?.options || []
  );
  const [checkResult, setCheckResult] = useState({});
  const [showCandyModal, setShowCandyModal] = useState(false);
  const [advanceAfterModal, setAdvanceAfterModal] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelect = (index) => {
    setSelected(index);
    if (index === currentQuestion.correctIndex) {
      setAdvanceAfterModal(true);
      setShowCandyModal(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion.type === "fill-in-blank") {
      if (
        fillAnswer.trim().toLowerCase() ===
        currentQuestion.correctAnswer.toLowerCase()
      ) {
        setAdvanceAfterModal(true);
        setShowCandyModal(true);
      } else {
        alert("Incorrect answer. Try again!");
      }
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelected(null);
      setFillAnswer("");
      setDragMatches({});
      setAvailableOptions(questions[currentQuestionIndex + 1]?.options || []);
      setCheckResult({});
    } else {
      navigate(-1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelected(null);
      setFillAnswer("");
      setDragMatches({});
      setAvailableOptions(
        questions[currentQuestionIndex - 1]?.options || []
      );
      setCheckResult({});
    }
  };

  const handleDragStart = (e, value) => {
    e.dataTransfer.setData("text/plain", value);
  };

  const handleDrop = (e, targetValue) => {
    e.preventDefault();
    const draggedValue = e.dataTransfer.getData("text/plain");

    setAvailableOptions((prev) =>
      prev.filter((opt) => opt !== draggedValue)
    );

    setDragMatches((prev) => ({
      ...prev,
      [targetValue]: draggedValue,
    }));

    setCheckResult({});
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFromDrop = (targetValue) => {
    const removedValue = dragMatches[targetValue];
    if (!removedValue) return;

    setAvailableOptions((prev) => [...prev, removedValue]);

    setDragMatches((prev) => {
      const newMatches = { ...prev };
      delete newMatches[targetValue];
      return newMatches;
    });

    setCheckResult({});
  };

  const handleCheck = () => {
    const results = {};
    let allCorrect = true;
    for (const [val, varName] of Object.entries(dragMatches)) {
      const correct = varName === currentQuestion.correctMatches[val];
      results[val] = correct ? "correct" : "wrong";
      if (!correct) allCorrect = false;
    }
    setCheckResult(results);

    if (
      allCorrect &&
      Object.keys(dragMatches).length === currentQuestion.values.length
    ) {
      setShowCandyModal(true);
      setAdvanceAfterModal(false);
    }
  };

  const handleModalClose = () => {
    setShowCandyModal(false);
    if (advanceAfterModal) {
      goToNextQuestion();
      setAdvanceAfterModal(false);
    }
  };

  const modalImage = currentQuestionIndex === 2 ? Candy3Img : CandyImg;

  return (
    <>
      {showCandyModal && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/60 z-50"
          onClick={handleModalClose}
        >
          <img
            src={modalImage}
            alt="Candy"
            className="w-90 h-100 object-contain"
            onClick={handleModalClose}
          />
        </div>
      )}

      <div className="w-full min-h-screen bg-[#FFFFFF] flex flex-col">
        {/* Header */}
        <div className="w-full flex items-center justify-start px-10 py-5">
          <span
            onClick={() => navigate(-1)}
            className="text-[#333] text-lg font-medium hover:underline cursor-pointer"
          >
            &larr;
          </span>
          <h1 className="ml-4 text-xl font-semibold text-[#333] whitespace-nowrap">
            Variables and Data Types
          </h1>
        </div>

        <div className="flex flex-1">
          {/* Left panel */}
          <div className="w-[400px] p-10 flex flex-col gap-6">
            {/* Timer */}
            <div className="w-full bg-white border-[#E8E4E4] rounded-lg p-6 flex flex-col items-center shadow">
              <div className="w-32 h-32 rounded-full bg-[#FCE2CC] flex items-center justify-center shadow-inner">
                <span className="text-[#D85E09] text-3xl font-bold">18:02</span>
              </div>
              <span className="mt-3 text-[#333] text-base font-medium">
                Time Remaining:
              </span>
            </div>

            {/* Question List */}
            <div className="w-full bg-white rounded-lg p-5 shadow">
              <h2 className="text-lg font-semibold text-[#333] pb-3">
                Questions List
              </h2>
              <div className="flex flex-col gap-3">
                {Array.from({ length: questions.length }, (_, i) => (
                  <div
                    key={i}
                    className={`w-full px-4 py-3 rounded cursor-pointer ${
                      i === currentQuestionIndex
                        ? "bg-[#FFE6D1] text-[#333] font-semibold"
                        : "bg-[#F5F5F5] text-[#555]"
                    }`}
                  >
                    Question {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 p-16 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-[#333] pt-5 pb-10 max-w-[800px] w-full">
              {currentQuestion.text}
            </h2>

            {/* Multiple Choice */}
            {currentQuestion.type === "multiple-choice" && (
              <div className="flex flex-col gap-4 w-full max-w-[800px]">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selected === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  let styles =
                    "w-full px-6 py-4 border rounded text-left cursor-pointer transition-all";

                  if (isSelected) {
                    if (isCorrect) {
                      styles +=
                        " border-[#D85E09] bg-[#FFF4EC] text-[#333] font-semibold";
                    } else {
                      styles +=
                        " border-red-500 bg-[#FFE9E9] text-[#333] font-semibold";
                    }
                  } else {
                    styles +=
                      " border-gray-300 bg-white hover:bg-[#F5F5F5]";
                  }

                  return (
                    <div
                      key={index}
                      className={styles}
                      onClick={() => handleSelect(index)}
                    >
                      <span className="font-bold mr-3">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {choice}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fill-in-blank */}
            {currentQuestion.type === "fill-in-blank" && (
              <div className="w-full max-w-[800px] flex flex-col gap-8">
                <div className="w-full bg-[#2D2D2D] rounded-lg px-6 py-8">
                  <p className="text-white text-lg">
                    <span className="text-[#FFFFFF] text-2xl font-bold">
                      ______
                    </span>{" "}
                    <span className="text-[#FFFFFF]">(</span>
                    <span className="text-green-400">"Hello, World!"</span>
                    <span className="text-[#FFFFFF]">)</span>
                  </p>
                </div>
                <input
                  type="text"
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-[#D85E09]"
                />
              </div>
            )}

            {/* Drag and Drop */}
            {currentQuestion.type === "drag-drop" && (
              <div className="w-full max-w-[800px] flex flex-col gap-10">
                <div className="flex justify-center gap-8 flex-wrap">
                  {availableOptions.map((option) => (
                    <div
                      key={option}
                      draggable
                      onDragStart={(e) => handleDragStart(e, option)}
                      className="px-6 py-3 border border-[#D85E09] rounded bg-white shadow-md text-[#333] font-semibold cursor-move hover:bg-[#F5F5F5] transition-all"
                    >
                      {option}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-5 w-full">
                  {currentQuestion.values.map((val) => {
                    const droppedValue = dragMatches[val];
                    const result = checkResult[val];
                    let borderColor = "border-gray-300";
                    if (result === "correct")
                      borderColor = "border-green-500 border-2";
                    if (result === "wrong")
                      borderColor = "border-red-500 border-2";

                    return (
                      <div
                        key={val}
                        onDrop={(e) => handleDrop(e, val)}
                        onDragOver={handleDragOver}
                        className={`flex justify-between items-center w-full border ${borderColor} rounded px-6 py-4 bg-white min-h-[60px] transition-colors hover:bg-[#F5F5F5]`}
                      >
                        <span className="text-lg font-medium text-[#333]">
                          {val}
                        </span>
                        <div className="flex items-center gap-4">
                          {droppedValue ? (
                            <div
                              className="flex items-center gap-3 cursor-pointer"
                              onClick={() => handleRemoveFromDrop(val)}
                            >
                              <span className="text-[#D85E09] font-bold">
                                {droppedValue}
                              </span>
                              <span className="text-gray-500 text-sm underline">
                                Remove
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              Drop variable here
                            </span>
                          )}
                          {result && (
                            <span
                              className={`text-sm font-bold ${
                                result === "correct"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {result === "correct"
                                ? "✅ Correct"
                                : "❌ Wrong"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-10 mt-10">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className={`bg-gradient-to-r from-gray-300 to-gray-400 text-white font-bold py-3 px-8 rounded transition-all duration-300 w-fit ${
                      currentQuestionIndex === 0
                        ? "cursor-not-allowed opacity-50"
                        : "hover:scale-105"
                    }`}
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleCheck}
                    className="bg-[#D85E09] text-white font-bold py-3 px-12 rounded hover:scale-105 transition-transform duration-300 w-fit"
                  >
                    Check
                  </button>
                </div>
              </div>
            )}

            {/* Buttons for other question types */}
            {(currentQuestion.type === "multiple-choice" ||
              currentQuestion.type === "fill-in-blank") && (
              <div className="flex justify-center gap-20 mt-20">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className={`bg-gradient-to-r from-gray-300 to-gray-400 text-white font-bold py-3 px-8 rounded transition-all duration-300 w-fit ${
                    currentQuestionIndex === 0
                      ? "cursor-not-allowed opacity-50"
                      : "hover:scale-105"
                  }`}
                >
                  Prev
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-[#D85E09] to-[#FFC482] text-white font-bold py-3 px-12 rounded hover:scale-105 transition-transform duration-300 w-fit"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConceptGame;
