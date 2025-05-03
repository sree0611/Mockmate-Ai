"use client"
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import QuestionsSection from './_components/QuestionsSection'
import RecordAnswerSection from './_components/RecordAnswerSection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const StartInterview = () => {
    const [interviewData, setInterviewData] = useState(null)
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState([])
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getInterviewDetails()
        }
    }, [interviewId])

    const getInterviewDetails = async () => {
        setLoading(true)
        try {
            const result = await db.select().from(MockInterview)
                .where(eq(MockInterview.mockId, interviewId))

            if (!result.length) {
                console.error("No interview found")
                return
            }

            const interview = result[0]

            setInterviewData(interview)

            // Parse JSON safely
            let jsonMockResp
            try {
                jsonMockResp = JSON.parse(interview.jsonMockResp)
            } catch (error) {
                console.error("Error parsing JSON:", error)
                return
            }

            if (jsonMockResp?.questions && jsonMockResp?.answers) {
                const formattedQuestions = jsonMockResp.questions.map((question, index) => ({
                    question,
                    answer: jsonMockResp.answers[index] || "No answer provided",
                }))
                setMockInterviewQuestion(formattedQuestions)
            } else {
                console.error("Invalid JSON structure: Missing 'questions' or 'answers' keys")
            }
        } catch (error) {
            console.error("Error fetching interview details:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='pt-28'>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-100 space-y-3">
                    <div className="flex space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                    <p className="text-gray-600 text-base font-normal">
                        Loading interviews, please wait...
                    </p>
                </div>
            ) : (
                <>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                        <QuestionsSection
                            mockInterviewQuestion={mockInterviewQuestion}
                            activeQuestionIndex={activeQuestionIndex}
                        />
                        <RecordAnswerSection
                            mockInterviewQuestion={mockInterviewQuestion}
                            activeQuestionIndex={activeQuestionIndex}
                            interviewData={interviewData}
                        />
                    </div>
                    <div className='flex justify-end gap-6'>
                        {activeQuestionIndex < mockInterviewQuestion.length - 1 ? (
                            <Button onClick={() => setActiveQuestionIndex(prev => prev + 1)}>
                                Next Question
                            </Button>
                        ) : (
                            <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
                                <Button>End Interview</Button>
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default StartInterview
