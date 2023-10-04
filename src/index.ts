// Note: In order to accomplish this. I used TypeScript
//#region Main
const userInput = document.getElementById("userInput") as HTMLInputElement | null;
const terminalOutput = document.getElementById("terminalOutput") as HTMLDivElement | null;
const inputfield = document.getElementById("dummyKeyboard") as HTMLInputElement | null;

// This checks if any required HTML Elements are missing.
if (!userInput || !terminalOutput || !inputfield) throw new Error("Required elements don't exist");

// This stops anyone from pasing into the input field
window.onload = () => {
    inputfield.onpaste = (e) => e.preventDefault();
};

interface Options extends ElementCreationOptions {
    id?: string;
    className?: string;
    innerHTML?: string;
    innerText?: string;
}
/* This creates an HTML element, it isn't required, but I wanted to make my life easier.
    This is the options type to create Elements:
        interface Options extends ElementCreationOptions {
            id?: string;
            className?: string;
            innerHTML?: string;
            innerText?: string;
        }
*/
function CreateElement<T extends keyof HTMLElementTagNameMap>(tagName: T, options?: Options) {
    if (options) {
        const element = document.createElement(tagName, {
            is: options.is,
        });
        if (options.id) element.id = options.id;
        if (options.className) element.className = options.className;
        if (options.innerHTML) element.innerHTML = options.innerHTML;
        if (options.innerText) element.innerText = options.innerText;
        return element;
    }
    else {
        return document.createElement(tagName);
    }
}

/* This removes part of a string from a starting index to what ever index you want.
    Notes:
        - Technically this is not necassary for this script
          You could use the string.Replace() function instead.
*/
function remove(string: string, from: number, to: number) {
    return string.substring(0, from) + string.substring(to);
}

type Command = {
    command: string;
    addedElements?: (AddElementWithText | AddElement)[];
};

interface AddElementWithText extends AddElement {
    string: string;
}

interface AddElement {
    count?: number;
    stringIndexOrReplacement: number | string;
    replaceAll?: boolean;
    tagName: keyof HTMLElementTagNameMap;
    options?: Options;
    elements?: (AddElementWithText | AddElement)[];
}
/* *IMPORTANT* These are the commands
    Here is the Command type:
        type Command = {
            command: string;
            addedElements?: (AddElementWithText | AddElement)[];
        };
    Notes
        - This type is given to each object in COMMANDS
        - The COMMANDS object itself has a type of {[key: string]: Command}.
    
    Here are the AddElement types:
        interface AddElementWithText extends AddElement {
            string: string;
        }
        interface AddElement {
            stringIndexOrReplacement: number | string;
            tagName: keyof HTMLElementTagNameMap;
            count?: number;
            replaceAll?: boolean;
            options?: Options;
            elements?: (AddedElementWithText | AddElement)[];
        }
    Notes:
        - The type AddElementWithText builds upon the Type AddElement
        - The ? (Question Mark) just means that variable can be null/undefined  (Basically you can leave it blank)
        - An interface is a type. Just like a class is a type too. In case you were cerious.
        - The type AddElementWithText is for you to animate text within Elements such as:
            -The word input is replaced and animted with [Your Input] <span class="code">[Your Input]</span>
            -At index 4 HTML Element <span class="code">[Your Input]</span> and [Your Input] is animted
        - The type AddElement is for you to replace text within Elements such as:
            -The break in your text is replaced with <br>
            -At index 7 HTML Element <br> is added
*/
const COMMANDS: { [key: string]: Command } = {
    help: {
        command:
            "Command matrix initialized. Accessible commands: about, experience, education, skills, acknowledges, contact, resume",
        addedElements: [
            {
                stringIndexOrReplacement: "about",
                string: "about",
                tagName: "span",
                options: {
                    className: "code",
                },
            },
            {
                stringIndexOrReplacement: "experience",
                string: "experience",
                tagName: "span",
                options: {
                    className: "code",
                },
            },
            {
                stringIndexOrReplacement: "education",
                string: "education",
                tagName: "span",
                options: {
                    className: "code",
                },
            },
            {
                stringIndexOrReplacement: "skills",
                string: "skills",
                tagName: "span",
                options: {
                    className: "code",
                },
            },
            {
                stringIndexOrReplacement: "acknowledges",
                string: "acknowledges",
                tagName: "span",
                options: {
                    className: "code",
                },
            },
            {
                stringIndexOrReplacement: "contact",
                string: "contact",
                tagName: "span",
                options: {
                    className: "code",
                },
            },
            {
                stringIndexOrReplacement: "resume",
                string: "resume",
                tagName: "span",
                options: {
                    className: "code",
                },
            },
        ],
    },
    about: {
        command: "about me",
    },
    skills: {
        command: "skillss",
    },
    education: {
        command: "Cyber Academy",
    },
    experience: {
        command:
            "Cyber Sentinel Apprenticebreak Currently honing my skills and defending the digital frontier against emerging threats.break",
        addedElements: [
            {
                stringIndexOrReplacement: "break",
                replaceAll: true,
                tagName: "br",
            },
        ],
    },
    acknowledges: {
        command:
            "Security Achievements: Breached firewalls, uncovered vulnerabilities, outsmarted intrusion systems, cracked codes, explored the deep web, remained anonymous.",
    },
    contact: {
        command: "For encrypted communications and collaboration, reach out through these secure channels:",
    },
};

// This returns true if an object is an instance of AddedElementWithText
function InstanceOfAddElementWithText(object: any): object is AddElementWithText {
    return "string" in object;
}

/* This gives the typing animation to a given text.
    Notes:
        - Unfortunately, you had HTML Elements within the text that had text that you wanted me to animate.
        In order to accomplish animating the text within these elements, This function is called again to
        give it the animation
        - The setInterval is no longer being used the way you first gave me. It is now updating every frame.
        This means that a delta time is calculated in order to create a custom timer. This allows the
        typing animation to pause as it waits for another typing anomtion for an element to finish.
*/
const typingAnimation = (
    text: string,
    output: HTMLElement,
    addedElements?: (AddElementWithText | AddElement)[],
    speed = 50
): Promise<boolean> => {
    return new Promise((resolve) => {
        let i = 0;
        let lastTimestamp = Date.now();
        let deltaTime: number = 0;
        let timer: number = 0;
        let deltaZero = false;
        const typeInterval = setInterval(async () => {
            /* Everything in region Calc calculates the delta time and adds it to the timer;
                Notes:
                    - If the bool deltaZero is true then that means this current animation
                      is paused in order to wait another animation to finish first.
            */
            //#region Calc
            const timestamp = Date.now();
            if (deltaZero) deltaTime = 0;
            else deltaTime = timestamp - lastTimestamp /*  / 1000 */;
            lastTimestamp = timestamp;
            timer += deltaTime;
            //#endregion Calc
            if (timer >= speed) {
                timer -= speed;
                let foundString = false;
                /* Everything in region AddedElements checks if a part of the text should be replaced with an HTML ELEMENT
                    Notes:
                        - You can also add an element by specifying an index and not a part of the text.
                        - This also animates any text within an HTML Element If its of type AddElementWithString.
                        - An HTML Element can come with text already in it as type ADDElement. This means the
                          text within the HTML Element will just show up with no animation.
                */
                //#region AddedElements
                if (addedElements) {
                    if (addedElements.length > 0) {
                        for (let index = 0; index < addedElements.length; index++) {
                            const addedElement = addedElements[index];
                            if (typeof addedElement.stringIndexOrReplacement == "number") {
                                if (addedElement.stringIndexOrReplacement === i) {
                                    if (!addedElement.replaceAll) {
                                        if (addedElement.count) {
                                            if (addedElement.count >= 1) break;
                                        }
                                    }
                                    const element = CreateElement(addedElement.tagName, addedElement.options);
                                    output.appendChild(element);
                                    deltaZero = true;
                                    if (!addedElement.replaceAll) {
                                        if (!addedElement.count) addedElement.count = 0;
                                        addedElement.count++;
                                    }
                                    if (InstanceOfAddElementWithText(addedElement)) {
                                        await typingAnimation(addedElement.string, element, addedElement.elements);
                                        addedElement;
                                    }
                                    deltaZero = false;
                                    foundString = true;
                                    if (!addedElement.replaceAll) {
                                        if (!addedElement.count) addedElement.count = 0;
                                        addedElement.count++;
                                    }
                                }
                            }
                            else {
                                if (text.indexOf(addedElement.stringIndexOrReplacement) === i) {
                                    if (!addedElement.replaceAll) {
                                        if (addedElement.count) {
                                            if (addedElement.count >= 1) break;
                                        }
                                    }
                                    const element = CreateElement(addedElement.tagName, addedElement.options);
                                    output.appendChild(element);
                                    if (text.includes(addedElement.stringIndexOrReplacement))
                                        // You can use either replace or remove
                                        // text = text.replace(addedElement.stringIndexOrReplacement, "");
                                        text = remove(text, i, i + addedElement.stringIndexOrReplacement.length - 1);
                                    if (InstanceOfAddElementWithText(addedElement)) {
                                        deltaZero = true;
                                        await typingAnimation(addedElement.string, element, addedElement.elements);
                                        deltaZero = false;
                                    }
                                    foundString = true;
                                    if (!addedElement.replaceAll) {
                                        if (!addedElement.count) addedElement.count = 0;
                                        addedElement.count++;
                                    }
                                }
                            }
                        }
                    }
                }
                //#endregion AddedElements
                if (!foundString) {
                    output.innerHTML += text.charAt(i);
                }
                i++;
                if (i > text.length - 1) {
                    clearInterval(typeInterval);
                    resolve(true);
                }
            }
        }, 0);
    });
};

// This listens for keys being pressed in the input field. Something is outputed only after the user has typed something and then hit the enter/return key.
inputfield.addEventListener("keypress", async (e) => {
    // Checks if target exists
    if (!e.target) throw new Error("Target does not exist");

    // This isn't required in JS, but in TS it is
    const target = e.target as HTMLInputElement;

    if (e.key === "Enter") {
        let input: keyof typeof COMMANDS = target.value.toLowerCase() as keyof typeof COMMANDS;
        if (typeof input === "number") return;
        if (input.length === 0) return;

        let output = "";

        /* This line is replaced by everything in the region OUT
            output = `<div class="terminal-line"><span class="success">➜</span> <span class="directory">~</span> ${input}</div>`;
        */
        //#region OUT
        const terminalLine1 = CreateElement("div", {
            className: "terminal-line",
        });

        const terminalLine2 = CreateElement("div", {
            className: "terminal-line",
        });
        terminalLine1.appendChild(terminalLine2);

        const success = CreateElement("span", {
            className: "success",
            innerHTML: "➜",
        });
        terminalLine2.appendChild(success);

        const directory = CreateElement("span", {
            className: "directory",
            innerHTML: "~",
        });
        terminalLine2.appendChild(directory);

        const inputSpan = CreateElement("span", {
            innerHTML: input,
        });
        terminalLine2.appendChild(inputSpan);
        //#endregion OUT

        /* This line is replaced by everything in the region TERM 
            terminalOutput.innerHTML = `${terminalOutput.innerHTML}<div class="terminal-line">${output}</div>`;
            Notes:
                - Everything in region TERM must occur before the function typingAnimation(output, text)
        */
        //#region TERM
        terminalOutput.innerHTML = `${terminalOutput.innerHTML}`;
        terminalOutput.appendChild(terminalLine1);
        //#endregion TERM
        if (!COMMANDS.hasOwnProperty(input)) {
            /* These lines are replaced by everything in the region OUT1
                output += `<div class="terminal-line">Unauthorized access attempt detected: <span class="code">${input}</span></div>`;
                console.log("Intrusion detected: Unauthorized command access");
            */

            //#region OUT1
            const terminalLine3 = CreateElement("div", {
                className: "terminal-line",
            });
            terminalLine1.appendChild(terminalLine3);
            output += `Unauthorized access attempt detected: input`;
            console.log("Intrusion detected: Unauthorized command access");
            //#endregion OUT1
            await typingAnimation(
                output,
                terminalLine3,
                [
                    {
                        string: input,
                        stringIndexOrReplacement: "input",
                        tagName: "span",
                        options: {
                            className: "code",
                        },
                    },
                ]
                // false
            );
        }
        else {
            const value = COMMANDS[input];
            output += value.command;
            await typingAnimation(output, terminalLine1, value.addedElements);
        }

        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        target.value = "";
    }
});
//#endregion Main
