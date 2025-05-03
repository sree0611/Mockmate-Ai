

import { Lightbulb, Volume2, VolumeX, X } from 'lucide-react';
import React, { useState } from 'react';

const QuestionsSection = ({ mockInterviewQuestion, activeQuestionIndex }) => {
    const [isSpeaking, setIsSpeaking] = useState(false); // State to track if speech is playing

    const textToSpeech = (text) => {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(text);
            speech.onstart = () => setIsSpeaking(true); // Set speaking state to true
            speech.onend = () => setIsSpeaking(false);  // Reset speaking state after speech ends
            window?.speechSynthesis.speak(speech);
        } else {
            alert('Sorry, Your browser does not support text-to-speech');
        }
    };

    const stopSpeech = () => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // Stop the speech
            setIsSpeaking(false); // Reset speaking state
        }
    };

    const handleVolumeClick = () => {
        const text = mockInterviewQuestion && mockInterviewQuestion[activeQuestionIndex]?.question;
        if (isSpeaking) {
            stopSpeech();
        } else {
            textToSpeech(text);
        }
    };

    return (
        <div className='p-5 mt-8 border rounded-lg'>
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-5'>
                {mockInterviewQuestion && mockInterviewQuestion?.map((question, index) => {
                    return (
                        <h2
                            key={index} // Add a key for list items
                            className={`p-2 bg-secondary rounded-full text-xs md:text-sm text-center cursor-pointer ${activeQuestionIndex === index && 'bg-violet-500 text-white'
                                }`}
                        >
                            Question #{index + 1}
                        </h2>
                    );
                })}
            </div>
            <h2 className='my-5 text-md md:text-lg'>
                {mockInterviewQuestion && mockInterviewQuestion[activeQuestionIndex]?.question}
            </h2>
            {isSpeaking ? (
                <VolumeX className='cursor-pointer' onClick={handleVolumeClick} />
            ) : (
                <Volume2 className='cursor-pointer' onClick={handleVolumeClick} />
            )}
            <div className='border rounded-lg p-5 bg-blue-100 mt-20'>
                <h2 className='flex gap-2 items-center text-blue-400'>
                    <Lightbulb />
                    <strong>Note:</strong>
                    <span className='text-sm my-2'>Start recording, then stop, and finally save your answer.</span>
                </h2>
            </div>
        </div>
    );
};

export default QuestionsSection;
