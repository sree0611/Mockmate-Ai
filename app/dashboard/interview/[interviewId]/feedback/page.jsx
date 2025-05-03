"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Headings } from "@/app/layoutcomponents/Heading";
import { cn } from "@/lib/utils";
import {
    Bot,
    ChevronLeft,
    CircleCheck,
    Star,
    UserCheck,
    MessageSquare,
} from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAImodal";

const Feedback = () => {
    const { interviewId } = useParams();
    const [feedbackList, setFeedbackList] = useState([]);
    const [activeFeed, setActiveFeed] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [coachOpen, setCoachOpen] = useState(false);
    const [coachChat, setCoachChat] = useState("");
    const [coachInput, setCoachInput] = useState("");
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (interviewId) {
            getFeedback();
        }
    }, [interviewId]);

    const fetchImprovementTips = async (correctAns, userAns) => {
        try {
            const prompt = `
      You're an interview coach.

      Compare the following answers and provide:
      1. Two to three actionable improvement tips.
      2. A rephrased version of the user's answer, improving its clarity and correctness.

      ✅ Correct Answer:
      ${correctAns}

      ❌ User's Answer:
      ${userAns}

      Respond in JSON format like:
      {
        "tips": "Tip 1...\\nTip 2...",
        "rephrased": "Improved version of user's answer."
      }
          `.trim();

            const result = await chatSession.sendMessage(prompt);
            const responseText = result.response.text().trim();

            const jsonMatch = responseText.match(/\{.*\}/s);
            if (!jsonMatch) throw new Error("Invalid AI response format.");

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                tips: parsed.tips,
                rephrased: parsed.rephrased,
            };
        } catch (error) {
            console.error("Gemini AI Feedback Error:", error);
            return {
                tips: "Unable to generate tips at this time.",
                rephrased: "Unable to rephrase answer at this time.",
            };
        }
    };

    const getFeedback = async () => {
        setIsLoading(true);
        try {
            const result = await db
                .select()
                .from(UserAnswer)
                .where(eq(UserAnswer.mockIdRef, interviewId))
                .orderBy(UserAnswer.id);

            const enriched = await Promise.all(
                result.map(async (feed) => {
                    const { tips, rephrased } = await fetchImprovementTips(
                        feed.correctAns,
                        feed.userAns
                    );
                    return { ...feed, improvementTips: tips, rephrasedAnswer: rephrased };
                })
            );

            setFeedbackList(enriched);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setIsLoading(false);
        }
    };

    //     setIsLoading(true);
    //     try {
    //         const result = await db
    //             .select()
    //             .from(UserAnswer)
    //             .where(eq(UserAnswer.mockIdRef, interviewId))
    //             .orderBy(UserAnswer.id);

    //         const enriched = await Promise.all(
    //             result.map(async (feed) => {
    //                 const improvementTips = await fetchImprovementTips(
    //                     feed.correctAns,
    //                     feed.userAns
    //                 );
    //                 return { ...feed, improvementTips };
    //             })
    //         );

    //         setFeedbackList(enriched);
    //     } catch (error) {
    //         console.error("Error fetching feedback:", error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const overAllRating = useMemo(() => {
        if (feedbackList.length === 0) return "0.0";
        const totalRatings = feedbackList.reduce(
            (acc, feedback) => acc + parseFloat(feedback.rating || "0"),
            0
        );
        return (totalRatings / feedbackList.length).toFixed(1);
    }, [feedbackList]);

    const handleCoachAsk = async () => {
        if (!coachInput.trim()) return toast.error("Enter a question");
        setIsSending(true);

        try {
            const prompt = `
    You're an AI interview coach. Here's the context of a user's interview.
    
    🧠 Question: ${activeQuestion?.question}
    ✅ Correct Answer: ${activeQuestion?.correctAns}
    ❌ User's Answer: ${activeQuestion?.userAns}
    
    User’s follow-up question:
    👉 ${coachInput}
    
    Respond with helpful, concise advice.
            `.trim();

            const result = await chatSession.sendMessage(prompt);
            const reply = result.response.text().trim();

            setCoachChat(
                (prev) => `${prev}\n\n👤 You: ${coachInput}\n\n🤖 Coach: ${reply}`
            );
            setCoachInput("");
        } catch (error) {
            console.error("Coach chat error:", error);
            toast.error("Failed to respond. Try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="pt-36 px-10 flex flex-col w-full gap-8 container">
            <Link href={"/dashboard"}>
                <div className="flex items-center gap-3 cursor-pointer hover:underline">
                    <ChevronLeft className="w-6 h-6" />
                    <p className="font-medium">Back to dashboard</p>
                </div>
            </Link>

            <Headings
                title="Congratulations!"
                description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[20vh] bg-gray-100 space-y-3">
                    <div className="flex space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                    <p className="text-gray-600 text-base font-normal">
                        Loading Feedbacks, please wait...
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-base text-muted-foreground">
                        Your overall interview rating:
                        <span className="text-emerald-500 font-semibold text-xl">
                            {" "}
                            {overAllRating} / 10
                        </span>
                    </p>

                    <Headings title="Interview Feedback" isSubHeading />

                    {feedbackList.length === 0 ? (
                        <p className="text-center font-bold text-xl">No Feedback Found</p>
                    ) : (
                        <Accordion type="single" collapsible className="space-y-6 mb-6">
                            {feedbackList.map((feed) => (
                                <AccordionItem
                                    key={feed.id}
                                    value={feed.id}
                                    className="border rounded-lg shadow-md"
                                >
                                    <AccordionTrigger
                                        onClick={() => setActiveFeed(feed.id)}
                                        className={cn(
                                            "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                                            activeFeed === feed.id
                                                ? "bg-gradient-to-r from-purple-50 to-blue-50"
                                                : "hover:bg-gray-50"
                                        )}
                                    >
                                        <span>{feed.question}</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                                        <div className="text-lg font-semibold text-gray-700">
                                            <Star className="inline mr-2 text-yellow-500" />
                                            Rating: {feed.rating}
                                        </div>
                                        <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                                            <CardTitle className="flex items-center text-lg">
                                                <CircleCheck className="mr-2 text-green-600" />
                                                Expected Answer
                                            </CardTitle>
                                            <CardDescription className="font-medium text-gray-700">
                                                {feed.correctAns}
                                            </CardDescription>
                                        </Card>
                                        <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                                            <CardTitle className="flex items-center text-lg">
                                                <UserCheck className="mr-2 text-yellow-600" />
                                                Your Answer
                                            </CardTitle>
                                            <CardDescription className="font-medium text-gray-700">
                                                {feed.userAns}
                                            </CardDescription>
                                        </Card>
                                        <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-md">
                                            <CardTitle className="flex items-center text-lg">
                                                <Bot className="mr-2 text-red-600" />
                                                Feedback
                                            </CardTitle>
                                            <CardDescription className="font-medium text-gray-700 whitespace-pre-line">
                                                {feed.feedback}
                                            </CardDescription>
                                        </Card>
                                        <Card className="border-none space-y-3 p-4 bg-blue-50 rounded-lg shadow-md">
                                            <CardTitle className="flex items-center text-lg">
                                                💡 Improvement Tips
                                            </CardTitle>{" "}
                                            <CardDescription className="font-medium text-gray-700 whitespace-pre-line">
                                                {feed.improvementTips}
                                            </CardDescription>
                                        </Card>
                                        <Card className="border-none space-y-3 p-4 bg-indigo-50 rounded-lg shadow-md">
                                            {" "}
                                            <CardTitle className="flex items-center text-lg text-indigo-700">
                                                ✍️ Rephrased Answer
                                            </CardTitle>
                                            <CardDescription className="font-medium text-gray-700 whitespace-pre-line">
                                                {feed.rephrasedAnswer}
                                            </CardDescription>
                                        </Card>

                                        <Button
                                            variant="outline"
                                            className="mt-4 px-4 py-2 flex items-center gap-2 rounded-full border-none bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 animate-pulse"
                                            onClick={() => {
                                                setCoachChat("");
                                                setCoachInput("");
                                                setActiveQuestion(feed);
                                                setCoachOpen(true);
                                            }}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            Chat with Coach
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </>
            )}

            <Dialog open={coachOpen} onOpenChange={setCoachOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Chat with AI Coach</DialogTitle>
                    </DialogHeader>

                    <div className="h-64 overflow-y-auto p-4 bg-gray-50 rounded border text-sm space-y-4">
                        {coachChat ? (
                            coachChat.split("\n\n").map((block, idx) => (
                                <div
                                    key={idx}
                                    className={
                                        block.startsWith("👤 You")
                                            ? "text-gray-700"
                                            : "text-blue-800"
                                    }
                                >
                                    {block}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic">
                                Ask me anything about this question…
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Ask a follow-up question..."
                            value={coachInput}
                            onChange={(e) => setCoachInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCoachAsk()}
                        />
                        <Button onClick={handleCoachAsk} disabled={isSending}>
                            {isSending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                                    Sending...
                                </div>
                            ) : (
                                "Send"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Feedback;
