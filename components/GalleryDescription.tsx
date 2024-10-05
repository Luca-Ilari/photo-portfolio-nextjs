"use client";
import { useState } from "react";
import { Cursor, Typewriter, useTypewriter } from "react-simple-typewriter";

const GalleryDescription = ({ title, date }: { title: string; date: string }) => {
    const [start, setStart] = useState(false);
    const secondLineStart = () => {
        setTimeout(() => {
            setStart(true);
        }, 300);
    };
    const [text, helper] = useTypewriter({
        words: [title],
        onLoopDone: secondLineStart,
        typeSpeed: 70,
    });

    return (
        <>
            <div style={{ height: "3rem" }}>
                <h1>
                    {text}
                    {!start && <Cursor cursorStyle={"█"} />}
                </h1>
                {start === true && (
                    <h2>
                        <Typewriter
                            words={[date]}
                            cursor
                            cursorStyle="█"
                            typeSpeed={70}
                            delaySpeed={1110}
                        />
                    </h2>
                )}
            </div>
        </>
    );
};
export default GalleryDescription;
