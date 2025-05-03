"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "/components/ui/dialog";
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Textarea } from "/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAImodal";
import { LoaderCircle } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { db } from "@/utils/db";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const AddNewInterview = () => {
    const [openDialog, setOpenDailog] = useState(false);
    const [jobPosition, setJobPosition] = useState(null);
    const [jobDesc, setJobDesc] = useState(null);
    const [jobExperience, setJobExperience] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jsonResponse, setJsonResponse] = useState([]);
    const { user } = useUser();
    const router = useRouter();



    const handleSubmit = async () => {
        setLoading(true);

        // Validate if all fields are filled
        if (!jobPosition || !jobDesc || !jobExperience) {
            toast.error("Please fill all the fields");
            setLoading(false);
            return;
        }


        const InputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. 
        Based on these details, generate 7 interview questions for begginer friendly along with their answers in JSON format. 
        The response should have 'questions' and 'answers' as fields in JSON.`;

        try {
            const result = await chatSession.sendMessage(InputPrompt);

            if (!result || !result.response) {
                throw new Error("Invalid response from AI service");
            }

            let MockResponse = result.response
                .text()
                .replace("```json", "")
                .replace("```", "");

            try {
                const parsedResponse = JSON.parse(MockResponse);
                setJsonResponse(parsedResponse);
            } catch (error) {

                throw new Error("Failed to parse AI response");

            }

            const res = await db
                .insert(MockInterview)
                .values({
                    mockId: uuidv4(),
                    jsonMockResp: MockResponse,
                    jobPosition,
                    jobDesc,
                    jobExperience,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format("DD-MM-yyyy"),
                })
                .returning({ mockId: MockInterview.mockId });

            if (res?.length > 0) {
                router.push(`/dashboard/interview/${res[0]?.mockId}`);
                setOpenDailog(false);
            } else {
                throw new Error("Database insert failed");
            }
        } catch (error) {
            console.error("Error:", error.message);
            // toast.error(error.message || "An error occurred. Please try again.");
            toast.error(" Please provide a realistic job title and description.")
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div
                className="p-10 border-2 rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
                onClick={() => setOpenDailog(true)}
            >
                <h2 className="text-lg font-bold">+ Add new</h2>
            </div>
            <Dialog open={openDialog} onOpenChange={() => setOpenDailog(false)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Tell us more about your job interview
                        </DialogTitle>
                        <DialogDescription>
                            <div>
                                <h2>
                                    Add detail about your job position/role, Job description and
                                    years of experience
                                </h2>
                                <div className="mt-7 my-2">
                                    <label>Job Role/Job Position</label>

                                    <Input

                                        onChange={(event) => setJobPosition(event.target.value)}
                                        className="mt-1.5"
                                        placeholder="Ex.Full Stack developer"
                                    />
                                </div>
                                <div className=" my-3">
                                    <label>Job Description/ Tech Stack (In Short)</label>
                                    <Textarea
                                        onChange={(event) => setJobDesc(event.target.value)}
                                        className="mt-1.5"
                                        placeholder="Ex.React, Angular, Mysql etc"
                                    />
                                </div>
                                <div className=" my-2">
                                    <label>Years of experience</label>
                                    <Input
                                        onChange={(event) => setJobExperience(event.target.value)}
                                        className="mt-1.5"
                                        placeholder="5"
                                        type="number"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-5 mt-5">
                                <Button variant="ghost" onClick={() => setOpenDailog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <LoaderCircle className="animate-spin" />
                                            Generating from Ai{" "}
                                        </>
                                    ) : (
                                        "Start Interview"
                                    )}
                                </Button>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddNewInterview;
