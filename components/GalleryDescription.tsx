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
            <div className="desc-text">
                <h3>
                    {text}
                    {!start && <Cursor cursorStyle={"█"} />}
                </h3>
                {date && start === true ? (
                    <h3>
                        <Typewriter
                            words={["date: " + date]}
                            cursor
                            cursorStyle="█"
                            typeSpeed={50}
                        />
                    </h3>
                ) : null}
            </div>
        </>
    );
};
export default GalleryDescription;
