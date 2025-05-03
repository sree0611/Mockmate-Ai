"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

const Interview = () => {
  const params = useParams();

  const [interviewData, setInterviewData] = useState([]);
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  useEffect(() => {
    if (params?.interviewId) {
      getInterviewDetails();
    }
  }, []);

  const getInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    setInterviewData(result[0]);
  };


  return (
    <div className="pt-36 container px-12">
      <h2 className="font-bold text-2xl">Let's Get Started </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col my-5 gap-5 ">
          <div className="flex flex-col gap-5 p-5 rounded-lg border-2">
            <h2 className="text-lg">
              <strong>Job Role/Job Position : </strong>
              {interviewData?.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description/Tech Stack : </strong>
              {interviewData?.jobDesc}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience : </strong>
              {interviewData?.jobExperience}
            </h2>
          </div>
          <div className="p-5 border-2 rounded-lg border-yellow-300 bg-[#dfeb75]">
            <h2 className="flex gap- items-center text-yellow-500">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="text-yellow-500 mt-2">
              {" "}
              Please enable your webcam and microphone to start the AI-generated
              mock interview. The interview consists of five questions. You’ll
              receive a personalized report based on your responses at the end.{" "}
            </h2>
          </div>
        </div>
        <div>
          {webcamEnabled ? (
            <Webcam
              onUserMedia={() => setWebcamEnabled(true)}
              onUserMediaError={() => setWebcamEnabled(false)}
              style={{
                height: 300,
                width: 300,
              }}
              mirrored={true}
            />
          ) : (
            <>
              <WebcamIcon className="h-72  my-7 w-full p-10 bg-secondary rounded-lg" />
              <Button
                variant="ghost"
                className="w-full border-2"
                onClick={() => setWebcamEnabled(true)}
              >
                Enable Web and Microphone
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-end items-end mt-4">
        <Link href={`/dashboard/interview/${params.interviewId}/start`}>
          <Button>Start Interview</Button>
        </Link>
      </div>
    </div>
  );
};

export default Interview;
