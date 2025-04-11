/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";
import { useNavigate } from "react-router-dom";
const declaration: FunctionDeclaration = {
  name: "interviewCompleted",
  description: "Function to be called when the interview is completed. when all 2 questions complted by user",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      status: {
        type: SchemaType.STRING,
        description: "Indicates that the interview has been completed.",
      },
      percentage: {
        type: SchemaType.STRING,
        description: "Score percentage for the entire interview.",
      },
    },
    required: ["status", "percentage"],
  },
};


function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();
  const navigate = useNavigate();
  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: 'You are an Interviewer assistant and Ask the user Specific 2 questions on react js and behave like a Interviewer and analyse the user movements and warn if anything suspicious on user movements Note:you should respond Initaillay Hai to the Interview person priorily and wish him best of luck and you need respond english only if user speaks ither langugae tell to user you need to explain in english only.After 2 Questions respond with the flag {Interview:"completed"} Note:You should wait for answers from users before precidding to next question.',
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        console.log(fc.args,"yuva")
        const str = (fc.args as any).status;
        console.log(str,"yuva")
        if (str === "completed") {
          // Get user email from localStorage
          const userEmail = localStorage.getItem('userEmail');

          // Prepare data to store (You can include other information as well)
          const interviewResult = {
            candidateName: userEmail,
            status: str,
            interviewScore: (fc.args as any).percentage, // Assuming percentage is returned from the API
          };

          // Make an API call to store the interview result
          fetch('http://localhost:5000/interviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(interviewResult),
          })
            .then(response => response.json())
            .then(data => {
              console.log('Interview result stored successfully:', data);
              // After storing the result, navigate to the completed route
              navigate("/completed");
            })
            .catch(error => {
              console.error('Error storing interview result:', error);
              // You can handle errors here (e.g., show an error message)
            });
        }
        // setJSONString(str);
      }
    
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
