"use client";
import { useState } from "react";
import { Cursor, Typewriter, useTypewriter } from "react-simple-typewriter";

const GalleryDescription = ({ title, date }: { title: string; date?: string }) => {
    const [start, setStart] = useState(false);
    const secondLineStart = () => {
        setTimeout(() => {
            setStart(true);
        }, 300);
    };
    const [text, helper] = useTypewriter({
        words: ["title: " + title],
        onLoopDone: secondLineStart,
        typeSpeed: 40,
    });

    return (
        <>
            <div style={{ height: "3rem" }}>
                <h1>
                    {text}
                    {!start && <Cursor cursorStyle={"█"} />}
                </h1>
                {date && start === true ? (
                    <h2>
                        <Typewriter
                            words={["date: " + date]}
                            cursor
                            cursorStyle="█"
                            typeSpeed={50}
                            delaySpeed={1110}
                        />
                    </h2>
                ) : null}
            </div>
        </>
    );
};
export default GalleryDescription;
