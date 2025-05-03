"use client"
import Image from "next/image";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import getScrollAnimation from "@/utils/getScrollAnimation";
import ScrollAnimationWrapper from "./ScrollAnimationWrapper";
import ButtonPrimary from "./ButtonPrimary";
import Link from "next/link";
// import Maps from "../../public/assets/HugeGlobal.svg";


const features = [
    "Realistic AI-Driven Interviews.",
    "Get real-time analysis of your answers with actionable insights to improve your interview skills.",
    "Access a curated library of interview questions designed specifically for your desired role.",
    "Practice interviews anytime, anywhere, fitting seamlessly into your busy schedule..",
    "AI-Powered Interview Helper",
    "AI-Powered Resume Builder"
]

const Feature = () => {
    const scrollAnimation = useMemo(() => getScrollAnimation(), []);

    return (
        <div
            className="max-w-screen-xl mt-8 mb-6 sm:mt-14 sm:mb-14 px-6 sm:px-8 lg:px-16 mx-auto"
            id="feature"
        >
            <div className="grid grid-flow-row sm:grid-flow-col grid-cols-1 sm:grid-cols-2 gap-8 p  y-8 my-12">
                <ScrollAnimationWrapper className="flex w-full justify-end">
                    <motion.div className="h-full w-full p-4" variants={scrollAnimation}>
                        <Image
                            src="/assets/Illustration2.png"
                            alt="VPN Illustrasi"
                            layout="responsive"
                            quality={100}
                            height={414}
                            width={508}
                        />
                    </motion.div>
                </ScrollAnimationWrapper>
                <ScrollAnimationWrapper>

                    <motion.div className="flex flex-col items-end justify-center ml-auto w-full lg:w-9/12" variants={scrollAnimation}>
                        <h3 className="text-3xl lg:text-4xl font-medium leading-relaxed text-black-600">
                            Unlock Your Potential with Advanced Features
                        </h3>
                        <p className="my-2 text-black-500">
                            From personalized feedback to tailored question banks, we provide everything you need to excel in your interviews.
                        </p>
                        <ul className="text-black-500 self-start list-inside ml-8">
                            {features.map((feature, index) => (
                                <motion.li
                                    className="relative circle-check custom-list"
                                    custom={{ duration: 2 + index }}
                                    variants={scrollAnimation}
                                    key={feature}
                                    whileHover={{
                                        scale: 1.1,
                                        transition: {
                                            duration: .2
                                        }
                                    }}>
                                    {feature}
                                </motion.li>
                            )
                            )}
                        </ul>
                    </motion.div>
                </ScrollAnimationWrapper>
            </div>
            <div className="flex flex-col w-full my-16">
                <ScrollAnimationWrapper>
                    <motion.h3
                        variants={scrollAnimation}
                        className="text-2xl sm:text-3xl lg:text-3xl font-medium text-black-600 leading-relaxed w-9/12 sm:w-6/12 lg:w-[60%] mx-auto">
                        Practice interviews anytime, anywhere, fitting seamlessly into your busy schedule.
                    </motion.h3>
                    {/* <motion.p className="leading-normal  mx-auto my-2 w-10/12 sm:w-7/12 lg:w-6/12" variants={scrollAnimation}>
                        See LaslesVPN everywhere to make it easier for you when you move
                        locations.
                    </motion.p> */}
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper>
                    <motion.div className="py-12 w-full px-8 mt-16" variants={scrollAnimation}>
                        {/* <Maps className="w-full h-auto" /> */}
                        <img src="/assets/HugeGlobal.svg" />
                    </motion.div>
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper>
                    <motion.div
                        className="w-full flex justify-evenly items-center mt-4 flex-wrap lg:flex-nowrap"
                        variants={scrollAnimation}
                    >
                        {/* <Netflix className="h-18 w-auto" /> */}
                        <img
                            src="/assets/Icon/amazon.png"
                            className="h-14 w-auto mt-4 lg:mt-2"
                            alt=""
                        />
                        <img
                            src="/assets/Icon/netflix.png"
                            className="h-14 w-auto mt-2 lg:mt-0"
                            alt=""
                        />
                        <img
                            src="/assets/Icon/reddit.png"
                            className="h-12 w-auto mt-2 lg:mt-0"
                            alt=""
                        />
                        <img
                            src="/assets/Icon/discord.png"
                            className="h-14 w-auto mt-2 lg:mt-0"
                            alt=""
                        />
                        <img
                            src="/assets/Icon/spotify.png"
                            className="h-12 w-auto mt-2 lg:mt-0"
                            alt=""
                        />
                    </motion.div>
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper className="relative w-full mt-16">
                    <motion.div variants={scrollAnimation} custom={{ duration: 3 }}>
                        <div className="absolute rounded-xl  py-8 sm:py-14 px-6 sm:px-12 lg:px-16 w-full flex flex-col sm:flex-row justify-between items-center z-10 bg-white-500">
                            <div className="flex flex-col text-left w-10/12 sm:w-7/12 lg:w-5/12 mb-6 sm:mb-0">
                                <h5 className="text-black-600 text-xl sm:text-2xl lg:text-3xl leading-relaxed font-medium">
                                    Stay Ahead in Your<br /> Career Journey
                                </h5>
                                <p>Expert advice, delivered to you.</p>
                            </div>
                            <Link href='/dashboard'>
                                <ButtonPrimary>Get Started</ButtonPrimary>
                            </Link>

                        </div>
                        <div
                            className="absolute bg-black-600 opacity-5 w-11/12 roudned-lg h-60 sm:h-56 top-0 mt-8 mx-auto left-0 right-0"
                            style={{ filter: "blur(114px)" }}
                        ></div>
                    </motion.div>
                </ScrollAnimationWrapper>
            </div>
        </div>
    );
};

export default Feature;
