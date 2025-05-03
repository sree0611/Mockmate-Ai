"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { chatSession } from "@/utils/GeminiAImodal";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import Select from "react-select";

export default function AIInterviewHelper() {
    const [activeTab, setActiveTab] = useState("industry");

    // Industry Q&A states
    const [industry, setIndustry] = useState("");
    const [qaList, setQaList] = useState([]);
    const [loadingQA, setLoadingQA] = useState(false);

    // Technical Question states
    const [language, setLanguage] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [techQuestions, setTechQuestions] = useState([]);
    const [loadingTech, setLoadingTech] = useState(false);

    // Quiz states
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);


    const [quizLanguage, setQuizLanguage] = useState("");
    const [quizDifficulty, setQuizDifficulty] = useState("");

    const fetchQA = async () => {
        if (!industry.trim()) return toast.error("Please enter an industry!");
        setLoadingQA(true);
        try {
            const prompt = `Generate 5 commonly asked interview questions for the ${industry} industry. Provide answers in JSON format with \"question\" and \"answer\" keys.`;
            const result = await chatSession.sendMessage(prompt);
            let MockResponse = result.response.text().replace("```json", "").replace("```", "");
            setQaList(JSON.parse(MockResponse));
        } catch (error) {
            console.error("Gemini AI Error:", error);
            toast.error("Failed to generate Q&A.");
        } finally {
            setLoadingQA(false);
        }
    };

    const questionsRef = useRef(null);

    const fetchTechQuestions = async () => {
        if (!language || !difficulty) return toast.error("Please select both fields!");
        setLoadingTech(true);
        try {
            const prompt = `Generate 5 technical interview questions for ${language?.value} at a ${difficulty?.value} level. Provide a detailed answer for each question. Format the response as a JSON array with \"question\" and \"answer\" keys.`;
            const result = await chatSession.sendMessage(prompt);
            const responseText = result.response.text().trim();
            const jsonMatch = responseText.match(/\[.*\]/s);
            if (!jsonMatch) throw new Error("Invalid AI response format.");
            const qaData = JSON.parse(jsonMatch[0]);
            setTechQuestions(qaData);
            questionsRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Gemini AI Error:", error);
            toast.error("Failed to generate Q&A.");
        } finally {
            setLoadingTech(false);
        }
    };

    const fetchQuiz = async () => {
        if (!quizLanguage || !quizDifficulty) return toast.error("Please select both fields!");
        setLoadingQuiz(true);
        try {
            const prompt = `Generate 5 multiple choice technical interview questions for ${quizLanguage?.value} at a ${quizDifficulty?.value} level. Each question should include 4 options with one correct answer. Format as JSON with keys: \"question\", \"options\" (array), and \"answer\" (string).`;
            const result = await chatSession.sendMessage(prompt);
            const responseText = result.response.text().trim();
            const jsonMatch = responseText.match(/\[.*\]/s);
            if (!jsonMatch) throw new Error("Invalid AI response format.");
            const quizData = JSON.parse(jsonMatch[0]);
            setQuizQuestions(quizData);
            setQuizAnswers({});
            setQuizResult(null);
        } catch (error) {
            console.error("Gemini AI Error:", error);
            toast.error("Failed to generate quiz.");
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleAnswerChange = (index, option) => {
        setQuizAnswers(prev => ({ ...prev, [index]: option }));
    };


    const submitQuiz = () => {
        // Check if all questions are answered
        const unanswered = quizQuestions.some((_, idx) => !quizAnswers[idx]);

        if (unanswered) {
            toast.error("Please answer all the questions before submitting.");
            return;  // Prevent submission
        }

        let score = 0;
        const results = quizQuestions.map((q, i) => {
            const correct = q.answer.trim();
            const userAnswer = quizAnswers[i] || "Not Answered";
            if (userAnswer === correct) score++;
            return {
                question: q.question,
                correctAnswer: correct,
                userAnswer: userAnswer,
                isCorrect: userAnswer === correct
            };
        });
        toast.success("Answers submitted successfully")
        setQuizResult({ score, results });

    };


    const clearQuiz = () => {
        setQuizQuestions([]);
        setQuizAnswers({});
        setQuizResult(null);
        setQuizLanguage(null)
        setQuizDifficulty(null)
    };

    const cleartechQuz = () => {
        setTechQuestions([])
        setLanguage(null)
        setDifficulty(null)
    };

    const languageOptions = [
        { value: "JavaScript", label: "JavaScript" },
        { value: "Python", label: "Python" },
        { value: "Java", label: "Java" },
        { value: "C++", label: "C++" },
        { value: "React", label: "React" },
        { value: "Node.js", label: "Node.js" },
        { value: "Php", label: "Php" },
        { value: "Cloud", label: "Cloud" },
    ];

    const difficultyOptions = [
        { value: "easy", label: "Easy" },
        { value: "medium", label: "Medium" },
        { value: "hard", label: "Hard" },
    ];





    return (
        <div className="container px-6 pt-28">
            <Link className="pb-8" href={'/dashboard'}>
                <div className='flex items-center gap-3 text-black cursor-pointer hover:underline'>
                    <ChevronLeft className='w-6 h-6' />
                    <p className='font-medium'>Back to dashboard</p>
                </div>
            </Link>
            <h1 className="text-3xl font-bold text-center mb-6">AI-Powered Interview Helper</h1>

            <Tabs defaultValue="industry" onValueChange={setActiveTab}>
                <TabsList className="flex justify-center gap-4 p-8 mb-6">
                    <TabsTrigger value="industry">Industry Q&A</TabsTrigger>
                    <TabsTrigger value="tech">Technical Questions</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                </TabsList>

                <TabsContent value="industry">
                    <div className="max-w-xl">
                        <h2 className="text-xl font-semibold mb-4">Industry-Specific Interview Q&A</h2>
                        <Input placeholder="Enter industry (e.g., AI, Cybersecurity)" value={industry} onChange={e => setIndustry(e.target.value)} className="mb-4" />
                        <Button onClick={fetchQA} className="w-full" disabled={loadingQA}>{loadingQA ? "Generating..." : "Get Q&A"}</Button>
                    </div>
                    {qaList.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            {qaList.map((qa, idx) => (
                                <Card key={idx}><CardContent className="p-4">
                                    <p className="font-semibold text-blue-600">Q: {qa.question}</p>
                                    <p className="mt-2 text-gray-700">A: <span className="font-medium">{qa.answer}</span></p>
                                </CardContent></Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="tech">
                    <div className="max-w-xl">
                        <h2 className="text-xl font-semibold mb-4">Technical Question Generator</h2>

                        <Select
                            value={language}
                            onChange={setLanguage}
                            options={languageOptions}
                            placeholder="Select Language"
                            isClearable={true} // allows clearing the selection
                            className="mb-2"
                        />

                        <Select
                            value={difficulty}
                            onChange={setDifficulty}
                            options={difficultyOptions}
                            placeholder="Select Difficulty"
                            isClearable={true} // allows clearing the selection
                        />
                        <div className="flex gap-3 mt-4">
                            <Button onClick={fetchTechQuestions} className="w-full " disabled={loadingTech}>{loadingTech ? "Generating..." : "Get Questions"}</Button>
                            <Button variant="outline" onClick={cleartechQuz}>Clear</Button>
                        </div>

                    </div>
                    {techQuestions.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 gap-4 mb-8">
                            {techQuestions.map((qa, idx) => (
                                <Card ref={questionsRef} key={idx} className="shadow-lg border border-gray-200">
                                    <CardContent className="p-4">
                                        <p className="font-semibold text-lg text-blue-600">Q: {qa.question}</p>
                                        {qa.answer.includes("```") ? (
                                            <pre className="bg-gray-900 text-white p-3 rounded-md mt-2 overflow-x-auto">
                                                <code>{qa.answer.replace(/```/g, "").trim()}</code>
                                            </pre>
                                        ) : (
                                            <p className="mt-2 text-gray-700"><span className="font-medium">{qa.answer}</span></p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="quiz">
                    <div className="max-w-xl">
                        <h2 className="text-xl font-semibold mb-4">Quiz Generator</h2>
                        <Select

                            value={quizLanguage}
                            onChange={setQuizLanguage}
                            options={languageOptions}
                            placeholder="Select Language"
                            isClearable={true} // allows clearing the selection
                            className="mb-2"
                        />

                        <Select
                            value={quizDifficulty}
                            onChange={setQuizDifficulty}
                            options={difficultyOptions}
                            placeholder="Select Difficulty"
                            isClearable={true} // allows clearing the selection
                        />

                        <div className="flex gap-3 mt-4">
                            <Button onClick={fetchQuiz} className="w-full" disabled={loadingQuiz}>{loadingQuiz ? "Generating..." : "Start Quiz"}</Button>
                            <Button variant="outline" onClick={clearQuiz}>Clear</Button>
                        </div>
                    </div>

                    {
                        quizResult && <div className="text-center mt-6">
                            <h3 className="text-xl font-bold text-green-700">
                                Score: {quizResult.score} / {quizQuestions.length}
                            </h3>
                        </div>
                    }

                    {quizQuestions.length > 0 && (
                        <div className="my-6 space-y-6">
                            {quizQuestions.map((q, idx) => (
                                <Card key={idx} className="border border-gray-200">
                                    <CardContent className="p-4">
                                        <p className="font-semibold text-blue-700">{idx + 1}. {q.question}</p>
                                        <div className="mt-2 space-y-2">
                                            {q.options.map((opt, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`question-${idx}`}
                                                        value={opt}
                                                        checked={quizAnswers[idx] === opt}
                                                        onChange={() => handleAnswerChange(idx, opt)}
                                                        disabled={!!quizResult}
                                                    />
                                                    <label
                                                        className={
                                                            quizResult
                                                                ? opt === quizResult.results[idx].correctAnswer
                                                                    ? "text-green-600 font-semibold"
                                                                    : opt === quizAnswers[idx] && opt !== quizResult.results[idx].correctAnswer
                                                                        ? "text-red-600"
                                                                        : ""
                                                                : ""
                                                        }
                                                    >
                                                        {opt}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        {quizResult && !quizResult.results[idx].isCorrect && (
                                            <p className="text-sm text-green-600 mt-2">
                                                Correct answer: <span className="font-semibold">{quizResult.results[idx].correctAnswer}</span>
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {quizResult ? (
                                <div className="text-center my-6">
                                    {/* <h3 className="text-xl font-bold text-green-700">
                                        Score: {quizResult.score} / {quizQuestions.length}
                                    </h3> */}
                                </div>
                            ) : (
                                <Button onClick={submitQuiz} className="mt-4 w-full" disabled={quizQuestions.some((_, idx) => !quizAnswers[idx])}>Submit Quiz</Button>
                            )}
                        </div>
                    )}


                </TabsContent>
            </Tabs>
        </div>
    );
}

