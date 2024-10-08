import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import Splash from "./Splash";

const Container = styled.div`
  width: 100%;
  max-width: 360px;
  height: 570px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  font-size: 16px;
  color: #fdba12;
  margin-bottom: 10px;
  margin-top: 10px;
`;

const BackButton = styled.div`
  font-size: 18px;
  cursor: pointer;
  text-align: left;
`;

const Question = styled.div`
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
`;

const AnswerInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 30px;
  font-size: 16px;
  text-align: center;
  box-sizing: border-box;

  &::placeholder {
    color: #6e6259;
    font-weight: 500;
  }
`;

const CharCount = styled.div`
  color: #888;
  font-size: 14px;
  margin-top: 20px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin: 0 5px;

  &.hint-button {
    background-color: #f0f0f0;
    color: black;
  }

  &.submit-button {
    background-color: #fdba12;
    color: black;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 300px;
  text-align: center;
`;

const QuizDetail = () => {
  const [charCount, setCharCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const keyword_list = location.state.keyword_list || {};
  const question = location.state.question || {};
  
  console.log(keyword_list)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    setCharCount(e.target.value.length);
    setUserAnswer(e.target.value);  // 사용자의 입력을 상태에 저장
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCheckAnswer = async () => {
    setShowSplash(true);
    try {
      // API에 POST 요청 보내기
      const response = await fetch(
        "http://localhost:8000/api/user/quiz-result",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: userAnswer,
            answer_id: question.answer_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API 요청에 실패했습니다.");
      }

      const res = await response.json();
      console.log("API 응답:", res);
      navigate("/result",{ state: { quiz_result : res, keyword_list: keyword_list} });
  } catch (error) {
    console.error("오류:", error);
  } finally {
    setShowSplash(false);
  };
}

  const handleHintClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (showSplash) {
    return <Splash />;
  }

  return (
    <Container>
      <div>
        <BackButton onClick={() => navigate(-1)}> ← </BackButton>
        <Header>{formatTime(timeLeft)} 남음</Header>
        <Question>
          {question.question_content || "질문을 불러오지 못했습니다."}
        </Question>
        <AnswerInput
          type="text"
          placeholder="빈칸에 정답을 입력해주세요"
          maxLength={100}
          onChange={handleInputChange}
        />
        <CharCount>{charCount}/100자</CharCount>
      </div>
      <Buttons>
        <Button className="hint-button" onClick={handleHintClick}>
          힌트 보기
        </Button>
        <Button className="submit-button" onClick={handleCheckAnswer}>
          정답 확인
        </Button>
      </Buttons>
    </Container>
  );
};


export default QuizDetail;
