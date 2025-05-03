"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, Save } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAImodal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

const RecordAnswerSection = ({ mockInterviewQuestion, activeQuestionIndex, interviewData }) => {
    const { user } = useUser();

    const [userAnswer, setUserAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAnswerSaved, setIsAnswerSaved] = useState(false);

    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
    });

    // Capture spoken words into state
    useEffect(() => {
        if (!results.length) return; // Prevent unnecessary updates

        const combineTranscripts = results
            .filter((result) => typeof result !== "string" && result?.transcript)
            .map((result) => result.transcript)
            .join(" ");

        setUserAnswer(combineTranscripts);
    }, [results]);

    // Reset answer when user switches to a new question
    useEffect(() => {
        setUserAnswer("");     // ✅ Clear recorded response
        setResults([]);        // ✅ Clear previous results
        setIsAnswerSaved(false); // ✅ Re-enable save button
    }, [activeQuestionIndex]);


    // 🎯 Start/Stop Recording
    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
            setIsAnswerSaved(false); // Reset save status
        }
    };



    // 🎯 Save Answer - Only when button is clicked
    const updateUserAnswer = async () => {
        if (!userAnswer.trim()) {
            toast("Error: No answer recorded!");
            return;
        }
        if (isAnswerSaved) {
            toast("Answer already saved!");
            return;
        }

        const toastId = toast.loading("Saving your answer...");
        setLoading(true);

        const feedbackPrompt = `Question: ${mockInterviewQuestion?.[activeQuestionIndex]?.question}, 
        User Answer: ${userAnswer}, 
        Give a JSON response with fields: rating (1-10) and feedback (3-5 lines of improvement).`;

        try {
            const result = await chatSession.sendMessage(feedbackPrompt);
            const MockResponse = result.response
                .text()
                .replace("```json", "")
                .replace("```", "");

            const JsonFeedbackResp = JSON.parse(MockResponse);

            const resp = await db.insert(UserAnswer).values({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion?.[activeQuestionIndex]?.question,
                correctAns: mockInterviewQuestion?.[activeQuestionIndex]?.answer,
                userAns: userAnswer,
                feedback: JsonFeedbackResp?.feedback,
                rating: JsonFeedbackResp?.rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format("DD-MM-yyyy"),
            });

            if (resp) {
                toast("Answer saved successfully!");
                setIsAnswerSaved(true); // ✅ Prevent duplicate save
            }
        } catch (error) {
            console.error("Error saving answer:", error);
            toast("Failed to save answer, please try again.");
        } finally {
            toast.dismiss(toastId);
            setLoading(false);
        }
    };


    // 🎯 Reset Answer
    const resetAnswer = () => {
        setUserAnswer("");
        setResults([]);
        setIsAnswerSaved(false); // ✅ Ensures save button re-enables
    };

    return (
        <div className="flex flex-col justify-center items-center mt-10">
            <div className="flex flex-col justify-center items-center rounded-md relative">
                <Image src="/web-cam3.avif" alt="webcam" width={300} height={300} className="absolute" />
                <Webcam
                    mirrored={true}
                    style={{
                        height: 300,
                        width: "100%",
                        zIndex: 10,
                    }}


                />
            </div>

            <div className="flex gap-4 my-6">
                {/* Start/Stop Recording Button */}
                <Button variant="outline" onClick={StartStopRecording} disabled={loading}>
                    {isRecording ? (
                        <h2 className="text-red-600 flex gap-2">
                            <Mic /> Stop Recording
                        </h2>
                    ) : (
                        "Record Answer"
                    )}
                </Button>

                {/* Save Answer Button */}
                {/* <Button variant="outline" onClick={updateUserAnswer} disabled={loading || isAnswerSaved || !userAnswer.trim()}>
                    <Save className="mr-2" /> Save Answer
                </Button> */}

                <Button
                    variant="outline"
                    onClick={updateUserAnswer}
                    disabled={loading || isAnswerSaved || !userAnswer.trim()}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                            <span>Saving Answer...</span>
                        </div>
                    ) : (
                        <>
                            <Save className="mr-2" /> Save Answer
                        </>
                    )}
                </Button>


            </div>
            {interimResult && (
                <p className="text-sm text-gray-500 mt-2">
                    <strong>Current Speech:</strong>
                    {interimResult}
                </p>
            )}
        </div>
    );
};

export default RecordAnswerSection;
