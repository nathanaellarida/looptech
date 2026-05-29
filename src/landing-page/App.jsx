import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Signup from "/src/signup/Signup"
import Login from "/src/login/Login"
import Challenge from "/src/challenges/Challenge"
import CodingFundamentals from "/src/challenges/CodingFundamentals"
import DigitalLiteracyHome from "/src/home/DigitalLiteracyHome"
import HomePage from '../home/HomePage';
import LandingPage from './LandingPage';
import CourseDetailCodingFundamentals from '../home/CourseDetailCodingFundamentals';
import ConceptIntro from '/src/challenges/ConceptIntro';
import ConceptGame from '/src/challenges/ConceptGame';
import CodingSolo from '/src/challenges/CodingSolo';
import CodingCompete from '/src/challenges/CodingCompete';
import CodingCollab from '/src/challenges/CodingCollab';
import Leaderboard from '../home/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Challenge" element={<Challenge />} />
        <Route path="/CodingFundamentals" element={<CodingFundamentals />} />
        <Route path="/DigitalLiteracyHome" element={<DigitalLiteracyHome />} />
        <Route path="/course/coding-fundamentals-detail" element={<CourseDetailCodingFundamentals />} />
        <Route path="/concept-intro" element={<ConceptIntro />} />
        <Route path="/concept-game" element={<ConceptGame />} />
        <Route path="/coding-solo" element={<CodingSolo />} />
        <Route path="/coding-compete" element={<CodingCompete />} />
        <Route path="/coding-collab" element={<CodingCollab />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
