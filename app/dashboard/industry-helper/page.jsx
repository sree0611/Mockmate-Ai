"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { chatSession } from "@/utils/GeminiAImodal";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";


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


    // Job Role & Skills Helper states
    const [jobRole, setJobRole] = useState("");
    const [jobInsights, setJobInsights] = useState(null);
    const [loadingJobInsights, setLoadingJobInsights] = useState(false);

    // Fetch Industry Q&A
    const fetchQA = async () => {
        if (!industry.trim()) return toast.error("Please enter an industry!");
        setLoadingQA(true);
        try {
            const prompt = `Generate 5 commonly asked interview questions for the ${industry} industry. Provide answers in JSON format with "question" and "answer" keys.`;
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


    const fetchTechQuestions = async () => {
        if (!language || !difficulty) {
            return toast.error("Please select both fields!");
        }

        setLoadingTech(true);

        try {
            const prompt = `
                Generate 5 technical interview questions for ${language} at a ${difficulty} level.
                Provide a detailed answer for each question.
                Format the response as a JSON array with "question" and "answer" keys.
            `;

            const result = await chatSession.sendMessage(prompt);
            let responseText = result.response.text().trim();

            // Extract only JSON part using regex
            const jsonMatch = responseText.match(/\[.*\]/s);

            if (!jsonMatch) {
                throw new Error("Invalid AI response format.");
            }

            const qaData = JSON.parse(jsonMatch[0]);

            // setQaList(qaData);
            setTechQuestions(qaData);
        } catch (error) {
            console.error("Gemini AI Error:", error);
            toast.error("Failed to generate Q&A.");
        } finally {
            setLoadingTech(false);
        }
    };


    // Fetch Job Role & Skills Insights
    const fetchJobInsights = async () => {
        if (!industry || !jobRole) {
            return toast.error("Please enter both Industry and Job Role!");
        }

        setLoadingJobInsights(true);
        try {
            const prompt = `
                Provide key skills, salary trends, and career growth insights for a ${jobRole} in the ${industry} industry.
                Format the response as JSON with keys: "skills", "salary", "career_growth".
            `;

            const result = await chatSession.sendMessage(prompt);
            let responseText = result.response.text().trim();

            // Extract JSON response using regex
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (!jsonMatch) {
                throw new Error("Invalid AI response format.");
            }

            console.log(jsonMatch, "ffs");


            setJobInsights(JSON.parse(jsonMatch[0]));
        } catch (error) {
            console.error("Gemini AI Error:", error);
            toast.error("Failed to fetch job insights.");
        } finally {
            setLoadingJobInsights(false);
        }
    };


    return (
        <div className="container  px-6 pt-28">
            <Link className="pb-8" href={'/dashboard'}>
                <div className='flex items-center gap-3 text-black cursor-pointer hover:underline'>
                    <ChevronLeft className='w-6 h-6' />
                    <p className='font-medium'>Back to dashboard</p>
                </div>
            </Link>
            <h1 className="text-3xl font-bold text-center mb-6">AI-Powered Interview Helper</h1>

            {/* Tabs for Switching Between Features */}
            <Tabs defaultValue="industry" onValueChange={setActiveTab} className="">
                <TabsList className="flex justify-center gap-4 p-8 mb-6">
                    <TabsTrigger value="industry" className="px-4 py-2">Industry Q&A</TabsTrigger>
                    <TabsTrigger value="tech" className="px-4 py-2">Technical Questions</TabsTrigger>
                    <TabsTrigger value="job" className="px-4 py-2">Job Role & Skills</TabsTrigger>
                </TabsList>

                {/* Industry Q&A Tab */}
                <TabsContent value="industry">
                    <div className="">
                        <div className="max-w-xl">
                            <h2 className="text-xl font-semibold mb-4">Industry-Specific Interview Q&A</h2>
                            <Input
                                type="text"
                                placeholder="Enter industry (e.g., AI, Cybersecurity)"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="mb-4"
                            />
                            <Button onClick={fetchQA} className="w-full" disabled={loadingQA}>
                                {loadingQA ? "Generating..." : "Get Q&A"}
                            </Button>

                        </div>

                        {qaList.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Q&A for {industry}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                                    {qaList.map((qa, idx) => (
                                        <Card key={idx} className="mb-3">
                                            <CardContent className="p-4">
                                                <p className="font-semibold text-blue-600">Q: {qa.question}</p>
                                                <p className="mt-2 text-gray-700">A: <span className="font-medium">{qa.answer}</span></p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Technical Questions Tab */}
                <TabsContent value="tech">
                    <div className="">

                        <div className="max-w-xl">


                            <h2 className="text-xl font-semibold mb-4">Technical Question Generator</h2>

                            <div className="mb-3">
                                <Select value={language} onValueChange={setLanguage} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="JavaScript">JavaScript</SelectItem>
                                        <SelectItem value="Python">Python</SelectItem>
                                        <SelectItem value="Java">Java</SelectItem>
                                        <SelectItem value="C++">C++</SelectItem>
                                        <SelectItem value="React">React</SelectItem>
                                        <SelectItem value="Node.js">Node.js</SelectItem>
                                        <SelectItem value="Php">Php</SelectItem>
                                        <SelectItem value="Cloud">Cloud</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>



                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>


                            <Button onClick={fetchTechQuestions} className="w-full mt-4" disabled={loadingTech}>
                                {loadingTech ? "Generating..." : "Get Questions"}
                            </Button>
                        </div>
                        {/* {techQuestions?.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Q&A for {language} ({difficulty})</h3>
                                <div className="grid grid-cols-1 pb-10 gap-4">
                                    {techQuestions.map((qa, idx) => (
                                        <Card key={idx}>
                                            <CardContent className="p-4">
                                                <p className="font-semibold text-blue-600">Q: {qa.question}</p>
                                                <p className="mt-2">A: {qa.answer}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )} */}
                        {/* Display Generated Q&A */}
                        {techQuestions.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Q&A for {language} ({difficulty})</h3>
                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    {techQuestions.map((qa, idx) => (
                                        <Card key={idx} className="shadow-lg border border-gray-200">
                                            <CardContent className="p-4">
                                                <p className="font-semibold text-lg text-blue-600">Q: {qa.question}</p>

                                                {/* If answer contains code, format it properly */}
                                                {qa.answer.includes("```") ? (
                                                    <pre className="bg-gray-900 text-white p-3 rounded-md mt-2 overflow-x-auto">
                                                        <code>{qa.answer.replace(/```/g, "").trim()}</code>
                                                    </pre>
                                                ) : (
                                                    <p className="mt-2 text-gray-700">
                                                        <span className="font-medium">{qa.answer}</span>
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>


                {/* Job Role & Skills Helper Tab */}
                <TabsContent value="job">
                    <div className="max-w-xl ">
                        <h2 className="text-xl font-semibold mb-4">Job Role & Skills Helper</h2>

                        <Input
                            type="text"
                            placeholder="Enter Industry (e.g., IT, Healthcare)"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="mb-3"
                        />

                        <Input
                            type="text"
                            placeholder="Enter Job Role (e.g., Software Engineer, Data Analyst)"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className="mb-3"
                        />

                        <Button onClick={fetchJobInsights} className="w-full" disabled={loadingJobInsights}>
                            {loadingJobInsights ? "Generating..." : "Get Insights"}
                        </Button>

                        {/* Display Job Role & Skills Insights */}
                        {/* {jobInsights && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Insights for {jobRole}</h3>

                                <Card className="mb-4">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-blue-600">Key Skills</h4>
                                        <p className="mt-2 text-gray-700">{jobInsights?.skills}</p>
                                    </CardContent>
                                </Card>

                                <Card className="mb-4">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-blue-600">Salary Trends</h4>
                                        <p className="mt-2 text-gray-700">{jobInsights?.salary}</p>
                                    </CardContent>
                                </Card>

                                <Card className="mb-4">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-blue-600">Career Growth Insights</h4>
                                        <p className="mt-2 text-gray-700">{jobInsights?.career_growth}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )} */}

                        {jobInsights && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Insights for {jobRole}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-5 w-96">
                                    {/* Key Skills */}
                                    <Card className="mb-4 w-36">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-blue-600">Key Skills</h4>
                                            {jobInsights.skills && (
                                                <div className="mt-2 text-gray-700">
                                                    {Object.entries(jobInsights.skills).map(([category, skills]) => (
                                                        <div key={category} className="mb-3">
                                                            <h5 className="font-medium text-gray-800 capitalize">{category.replace("_", " ")}:</h5>
                                                            <ul className="list-disc list-inside ml-4">
                                                                {skills.map((skill, index) => (
                                                                    <li key={index}>{skill}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Salary Trends */}
                                    <Card className="mb-4 w-36">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-blue-600">Salary Trends</h4>
                                            {jobInsights.salary && (
                                                <div className="mt-2 text-gray-700">
                                                    {Object.entries(jobInsights.salary).map(([level, info]) => (
                                                        <div key={level} className="mb-3">
                                                            <h5 className="font-medium text-gray-800 capitalize">{level.replace("_", " ")}:</h5>
                                                            {typeof info === "object" ? (
                                                                <div className="ml-4">
                                                                    <p><strong>Range:</strong> {info.range}</p>
                                                                    <p className="text-sm text-gray-600">{info.notes}</p>
                                                                </div>
                                                            ) : (
                                                                <p>{info}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Career Growth */}
                                    <Card className="mb-4 w-36">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-blue-600">Career Growth Insights</h4>
                                            {jobInsights.career_growth && (
                                                <div className="mt-2 text-gray-700">
                                                    {Object.entries(jobInsights.career_growth).map(([category, details]) => (
                                                        <div key={category} className="mb-3">
                                                            <h5 className="font-medium text-gray-800 capitalize">{category.replace("_", " ")}:</h5>
                                                            <ul className="list-disc list-inside ml-4">
                                                                {details.map((item, index) => (
                                                                    <li key={index}>{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
