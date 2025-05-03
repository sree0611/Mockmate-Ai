
"use client"
import React from "react";
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from "./_components/InterviewList";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FileText, HelpCircle } from "lucide-react";

const Dashboard = () => {
    const router = useRouter()

    const handleClick = () => {
        router.push('/dashboard/resume')
    }

    const handleHelper = () => {
        router.push('/dashboard/industry-helper')
    }

    return (
        <div className="py-32 px-10">
            <div className="flex justify-between gap-5">
                <div>
                    <h2 className="font-bold text-2xl">Dashboard</h2>
                    <h2 className="text-gray-500">Create and Start your AI Mockup</h2>
                </div>
                <div className="flex gap-3">
                    {/* Resume Builder Button - Black */}

                    <Button onClick={handleClick} className="bg-black text-white hover:bg-gray-800">
                        <FileText className="w-6 h-6 mr-2" /> Resume Builder
                    </Button>

                    {/* Interview Helper Button - Blue */}
                    <Button onClick={handleHelper} className="bg-blue-600 text-white hover:bg-blue-700">
                        <HelpCircle className="w-6 h-6 mr-2" /> Interview Helper
                    </Button>
                </div>

            </div>

            <div className="grid grid-col-1 md:grid-cols-3 my-5">
                <AddNewInterview />
            </div>
            <InterviewList />
        </div>
    );
};

export default Dashboard;



