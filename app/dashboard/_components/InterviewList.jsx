"use client"
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { desc, eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import InterviewListCard from './InterviewListCard'
import { toast } from 'sonner'

const InterviewList = () => {
    const { user } = useUser()
    const [interviewList, setInterviewList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            getInterviewList()
        }
    }, [user])

    const getInterviewList = async () => {
        setLoading(true)
        try {
            const result = await db.select()
                .from(MockInterview)
                .where(eq(MockInterview?.createdBy, user?.primaryEmailAddress?.emailAddress))
                .orderBy(desc(MockInterview?.id))
            setInterviewList(result)
        } catch (error) {
            console.error("Error fetching interviews:", error)
            toast.error("Error fetching interviews:")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 className='font-medium text-lg'>Previous Mock Interview</h2>
            {loading ? (
                <div className="flex flex-col justify-center items-center mt-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-600">Loading interviews, please wait...</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mt-4'>
                    {interviewList.length > 0 ? (
                        interviewList.map((item, index) => (
                            <InterviewListCard interviewList={item} key={index} />
                        ))
                    ) : (
                        <p className="text-gray-500">No interviews found.</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default InterviewList



