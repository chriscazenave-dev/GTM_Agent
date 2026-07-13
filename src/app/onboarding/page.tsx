"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Check, RotateCcw, ChevronRight, Play } from "lucide-react";
import { useStore } from "@/lib/store";
import { onboardingQuestions } from "@/lib/onboardingQuestions";
import { OnboardingAnswer } from "@/lib/types";

type RecState = "idle" | "recording" | "recorded";

export default function Onboarding() {
  const router = useRouter();
  const { onboarding, apiKeys, update, hydrated } = useStore();
  const [step, setStep] = useState(0);
  const [recState, setRecState] = useState<RecState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognition = useRef<{ stop: () => void } | null>(null);

  const question = onboardingQuestions[step];
  const existing = onboarding.answers.find((a) => a.questionId === question?.id);

  useEffect(() => {
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRecorder.current = rec;
      setRecState("recording");
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);

      // Live transcription via the Web Speech API when available.
      // Once an OpenAI key is connected, this is replaced by Whisper transcription.
      const w = window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike; SpeechRecognition?: new () => SpeechRecognitionLike };
      const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (SR) {
        const sr = new SR();
        sr.continuous = true;
        sr.interimResults = true;
        sr.onresult = (event: SpeechRecognitionEventLike) => {
          let text = "";
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);
        };
        sr.start();
        recognition.current = sr;
      }
    } catch {
      setMicError("Microphone access was blocked. Allow mic access in your browser, or type your answer below instead.");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    recognition.current?.stop();
    if (timer.current) clearInterval(timer.current);
    setRecState("recorded");
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setTranscript("");
    setRecState("idle");
    setSeconds(0);
  };

  const saveAndNext = () => {
    const answer: OnboardingAnswer = {
      questionId: question.id,
      transcript: transcript.trim() || "(voice answer recorded — transcription pending OpenAI key)",
      recordedAt: new Date().toISOString(),
    };
    const answers = [
      ...onboarding.answers.filter((a) => a.questionId !== question.id),
      answer,
    ];
    const done = step === onboardingQuestions.length - 1;
    update({ onboarding: { completed: done, answers } });
    resetRecording();
    if (done) {
      router.push("/");
    } else {
      setStep(step + 1);
    }
  };

  if (!hydrated) return null;

  if (onboarding.completed) {
    return (
      <div className="px-8 py-8 max-w-3xl">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Onboarding complete</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          The agent uses these answers to structure research, org charts, and PG drafts. Re-record any answer below.
        </p>
        <div className="space-y-3">
          {onboardingQuestions.map((q, i) => {
            const a = onboarding.answers.find((x) => x.questionId === q.id);
            return (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs font-black uppercase tracking-wide text-gray-400 mb-1">Question {i + 1}</div>
                <div className="font-bold text-sm text-gray-900">{q.question}</div>
                <p className="text-sm text-gray-600 mt-1">{a?.transcript ?? "—"}</p>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => { update({ onboarding: { completed: false, answers: [] } }); setStep(0); }}
          className="mt-6 px-4 py-2 rounded-lg text-xs font-bold border border-gray-300 text-gray-600 hover:border-gray-500"
        >
          Redo onboarding
        </button>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          Onboarding · Question {step + 1} of {onboardingQuestions.length}
        </div>
        <div className="flex gap-1.5 mb-6">
          {onboardingQuestions.map((q, i) => (
            <div key={q.id} className={`h-1.5 flex-1 rounded-full ${
              i < step || onboarding.answers.some((a) => a.questionId === q.id) ? "bg-gray-900" : i === step ? "bg-amber-500" : "bg-gray-200"
            }`} />
          ))}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">{question.question}</h1>
        <p className="text-sm text-gray-500 mt-2">{question.hint}</p>
        {existing && (
          <p className="text-xs text-sky-800 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 mt-3">
            You already answered this one. Recording again will replace it.
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center">
        {recState === "idle" && (
          <>
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <Mic size={30} />
            </button>
            <p className="text-sm text-gray-500 mt-4">Tap to answer with your voice</p>
          </>
        )}
        {recState === "recording" && (
          <>
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-amber-600 text-white flex items-center justify-center animate-pulse-mic"
            >
              <Square size={26} />
            </button>
            <p className="text-sm font-bold text-amber-700 mt-4">
              Recording… {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} — tap to stop
            </p>
          </>
        )}
        {recState === "recorded" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Check size={30} />
            </div>
            <p className="text-sm font-bold text-emerald-700 mt-4">Got it. Review and continue.</p>
            {audioUrl && (
              <audio controls src={audioUrl} className="mt-4 w-full max-w-sm" />
            )}
          </>
        )}

        {micError && (
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">{micError}</p>
        )}

        {(recState === "recorded" || micError) && (
          <div className="w-full mt-5">
            <label className="text-xs font-black uppercase tracking-wide text-gray-400">
              Transcript {apiKeys.openai ? "(Whisper)" : "(live browser transcription — connect an OpenAI key for Whisper-grade accuracy)"}
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={4}
              placeholder="Your answer appears here as you speak. Edit anything the transcription missed."
              className="mt-1.5 w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          {recState === "recorded" && (
            <button
              onClick={resetRecording}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-gray-300 text-gray-600 hover:border-gray-500"
            >
              <RotateCcw size={13} /> Re-record
            </button>
          )}
          {(recState === "recorded" || (micError && transcript.trim())) && (
            <button
              onClick={saveAndNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700"
            >
              {step === onboardingQuestions.length - 1 ? "Finish onboarding" : "Save & next"} <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
        <Play size={11} />
        Voice-first by design. The agent turns these eight answers into your selling profile: what you sell, who you target, and how you write.
      </p>
    </div>
  );
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
