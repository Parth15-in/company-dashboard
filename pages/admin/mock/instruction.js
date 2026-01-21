// pages/admin/mock/instruction.js
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IoIosArrowBack } from "react-icons/io";
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';

function Instruction() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const recognitionRef = useRef(null);
    const [deviceTests, setDeviceTests] = useState({
        speaker: {
            done: false,
            testing: false
        },
        microphone: {
            done: false,
            testing: false,
            permissionGranted: false,
            status: '',
        },
    });

    const slides = [
        {
            id: 1,
            title: "Understand the job role",
            img: '/Shawn.png',
            content: "1. Understanding the job role means researching its key responsibilities, required skills, and expectations. This helps you tailor your resume, answer interview questions confidently, and demonstrate how your abilities align with the position.",
        },
        {
            id: 2,
            img: '/Job_Discrioption.png',
            title: "Understand the Job Description",
            content: "2. Carefully read and analyze the job description to grasp the key qualifications, duties, and expectations. Prepare examples of how your skills and experiences match the job requirements",
        },
        {
            id: 3,
            img: '/companys_background..png',
            title: "Understand the collage's background",
            content: "3. Understanding the collage's background means learning about its history, mission, values, products, services, and industry position. This helps you align your answers in interviews and show genuine interest in the organization",
        },
        {
            id: 4,
            img: '/Self_Introduction.png',
            title: "Practice Your Self Introduction",
            content: "4. Introduce yourself briefly, highlight key skills, experience, and achievements, and connect them to the job role",
        },
        {
            id: 5,
            img: '/Resume.png',
            title: "Update Your Resume and Carry 1/2 copies",
            content: "5. Ensure your resume and other application materials are updated, tailored to the job, and neatly organized. Bring multiple copies of your resume and any other requested documents",
        },
        {
            id: 6,
            img: '/Yourself_Professionally.png',
            title: "Present Yourself Professionally",
            content: "6. Dress appropriately for the industry and collage culture. Pay attention to grooming and personal hygiene to make a positive impression",
        },
        {
            id: 7,
            img: '/Essential_Documents.png',
            title: "Gather and Organize Essential Documents",
            content: "7. Collect and neatly organize all necessary documents, such as certificates, references, and identification. Use a folder or portfolio to keep everything tidy and easily accessible",
        },
        {
            id: 8,
            img: '/company_News.png',
            title: "Stay Up-to-Date on collage News",
            content: "8. Research the collage's recent news, achievements, and initiatives. This demonstrates your interest in the collage and can provide valuable conversation topics",
        },
        {
            id: 9,
            img: '/Thoughtful_Questions.png',
            title: " Prepare Thoughtful Questions",
            content: '9. Develop a list of insightful questions to ask the interviewer, such as "What are the biggest challenges facing the team?" or "Can you tell me more about the collage culture?',
        },
        {
            id: 10,
            img: '/Rest_Preparation.png',
            title: " Get Adequate Rest and Preparation",
            content: '10. Ensure you get sufficient sleep and time to prepare before the interview. This will help you feel confident, focused, and ready to make a positive impression',
        },
    ];

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const testSpeaker = () => {
        setDeviceTests(prev => ({
            ...prev,
            speaker: { ...prev.speaker, testing: true }
        }));

        // Simple speaker test
        const utterance = new SpeechSynthesisUtterance('Speaker test one two three');
        utterance.onend = () => {
            setDeviceTests(prev => ({
                ...prev,
                speaker: { done: true, testing: false }
            }));
        };

        utterance.onerror = (event) => {
            console.error('Speaker test error:', event);
            setDeviceTests(prev => ({
                ...prev,
                speaker: { done: false, testing: false }
            }));
        };

        window.speechSynthesis.speak(utterance);
    };

    const testMicrophone = async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setDeviceTests(prev => ({
                ...prev,
                microphone: {
                    ...prev.microphone,
                    testing: true,
                    status: 'Listening... Speak now!',
                },
            }));
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            if (transcript.trim().length > 0) {
                recognition.stop();
                setDeviceTests(prev => ({
                    ...prev,
                    microphone: {
                        done: true,
                        testing: false,
                        permissionGranted: true,
                        status: '✓ Microphone is working!',
                    },
                }));
            }
        };

        recognition.onerror = (event) => {
            let errorMessage = 'An error occurred during microphone testing.';
            if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access was denied. Please allow access in your browser settings.';
            } else if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try again.';
            } else if (event.error === 'audio-capture') {
                errorMessage = 'No microphone found. Please connect a microphone.';
            }

            recognition.stop();
            setDeviceTests(prev => ({
                ...prev,
                microphone: {
                    done: false,
                    testing: false,
                    permissionGranted: false,
                    status: errorMessage,
                },
            }));
        };

        recognition.onend = () => {
            if (!deviceTests.microphone.done) {
                setDeviceTests(prev => ({
                    ...prev,
                    microphone: {
                        ...prev.microphone,
                        testing: false,
                        status: '✓ Tested ',
                    },
                }));
            }
        };

        recognition.start();
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const handleStartInterview = () => {
        if (deviceTests.speaker.done && deviceTests.microphone.done) {
            router.push('/admin/mock/questionForm');
        } else {
            let message = 'Please complete the following tests before starting:\n';
            if (!deviceTests.speaker.done) message += '- Speaker Test\n';
            if (!deviceTests.microphone.done) message += '- Microphone Test\n';
            alert(message);
        }
    };



    // Check for authentication
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         router.push('/login');
    //     }
    // }, [router]);

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % slides.length);
        }, 10000);

        return () => clearInterval(timer);
    }, [slides.length]);

    // Cleanup microphone test on unmount
    useEffect(() => {
        return () => {
            if (window.SpeechRecognition || window.webkitSpeechRecognition) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.stop();
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="text-white text-2xl w-8 h-8 flex items-center justify-center mb-12"
            >
                <IoIosArrowBack />
            </button>

            <div className="max-w-md mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl font-normal text-center mb-2">Instructions</h1>
                    <p className="text-gray-400 text-center">Please follow these instructions carefully</p>
                </div>

                {/* Slides Container */}
                <div className="bg-gray-900 rounded-xl p-8 mb-8 min-h-64 relative">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`transition-opacity duration-300 ${currentIndex === index ? 'opacity-100' : 'opacity-0 absolute inset-0 p-6'}`}
                        >
                            <div className="flex items-center mb-4">
                                <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-medium">{slide.title}</h3>
                            </div>
                            <p className="text-gray-300 text-sm pl-13">{slide.content}</p>
                        </div>
                    ))}

                    {/* Navigation Dots */}
                    <div className="flex justify-center mt-6 space-x-2 absolute bottom-4 left-0 right-0">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-600'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Device Test Section */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-medium mb-4">Device Check</h3>

                    <div className="space-y-4">
                        {/* Speaker Test */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FaVolumeUp className="text-blue-400 mr-2" />
                                <span>Speaker Test</span>
                            </div>
                            {deviceTests.speaker.done ? (
                                <span className="text-green-400 text-sm">✓ Tested</span>
                            ) : (
                                <button
                                    onClick={testSpeaker}
                                    disabled={deviceTests.speaker.testing}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                >
                                    {deviceTests.speaker.testing ? 'Testing...' : 'Test'}
                                </button>
                            )}
                        </div>

                        {/* Microphone Test */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FaMicrophone className="text-blue-400 mr-2" />
                                <span>Microphone Test</span>
                            </div>
                            {deviceTests.microphone.testing ? (
                                <div className="flex items-center">
                                    <span className="flex space-x-1">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                    <span className="ml-2 text-blue-400 text-sm">Listening...</span>
                                </div>
                            ) : deviceTests.microphone.done ? (
                                <span className="text-green-400 text-sm">
                                    {deviceTests.microphone.status || '✓ Working'}
                                </span>
                            ) : (
                                <button
                                    onClick={testMicrophone}
                                    disabled={deviceTests.microphone.testing}
                                    className={`text-sm px-4 py-2 rounded-lg flex items-center 
              ${deviceTests.microphone.testing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    {deviceTests.microphone.testing ? (
                                        <>
                                            <span className="inline-block w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
                                            Listening...
                                        </>
                                    ) : 'Test Microphone'}
                                </button>

                            )}
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStartInterview}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${deviceTests.speaker.done && deviceTests.microphone.done
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Start Interview
                </button>
            </div>
        </div>
    );
}

export default Instruction;
