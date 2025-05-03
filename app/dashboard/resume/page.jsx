"use client";

import { Resume } from "@/utils/schema";
import ResumeBuilder from "./_components/resume-builder";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react"
import { db } from "@/utils/db";
import { eq } from "drizzle-orm";


const ResumePage = () => {

    const { isSignedIn, user } = useUser();


    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);




    useEffect(() => {
        if (user && user?.primaryEmailAddress) {
            fetchResume();
        }
    }, [user]);


    const fetchResume = async () => {
        const result = await db
            .select()
            .from(Resume)
            .where(eq(Resume.userEmail, user?.primaryEmailAddress?.emailAddress));
        setResume(result)

    }

    return (
        <div className="container mx-auto py-6  px-8">

            <ResumeBuilder initialContent={resume && resume[0]?.content} />
        </div>
    );
}



export default ResumePage;
