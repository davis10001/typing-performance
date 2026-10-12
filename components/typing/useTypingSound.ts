"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const typingSoundStorageKey = "typing-level:typing-sound:v1";

export function useTypingSound() {
  const [enabled, setEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setEnabled(window.localStorage.getItem(typingSoundStorageKey) !== "off");
      } catch {
        // Sound remains available when storage is unavailable.
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (audioContextRef.current) void audioContextRef.current.close();
      audioContextRef.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(typingSoundStorageKey, next ? "on" : "off");
      } catch {
        // The sound control still works for this visit when storage is unavailable.
      }
      return next;
    });
  }, []);

  const play = useCallback((backspace = false) => {
    let soundEnabled = enabled;
    try {
      soundEnabled = window.localStorage.getItem(typingSoundStorageKey) !== "off";
    } catch {
      // Fall back to the in-memory preference when storage is unavailable.
    }
    if (!soundEnabled || !window.AudioContext) return;
    try {
      const audio = audioContextRef.current ?? new window.AudioContext();
      audioContextRef.current = audio;
      if (audio.state === "suspended") void audio.resume();
      if (!clickBufferRef.current) {
        const length = Math.ceil(audio.sampleRate * 0.035);
        const buffer = audio.createBuffer(1, length, audio.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < length; index += 1) {
          samples[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 1.5);
        }
        clickBufferRef.current = buffer;
      }
      const source = audio.createBufferSource();
      const tone = audio.createBiquadFilter();
      const volume = audio.createGain();
      const now = audio.currentTime;
      source.buffer = clickBufferRef.current;
      source.playbackRate.value = (backspace ? 0.77 : 0.95) + Math.random() * 0.12;
      tone.type = "bandpass";
      tone.frequency.value = backspace ? 1150 : 1850;
      tone.Q.value = 0.7;
      volume.gain.setValueAtTime(0.22, now);
      volume.gain.exponentialRampToValueAtTime(0.004, now + 0.032);
      source.connect(tone).connect(volume).connect(audio.destination);
      source.start(now);
    } catch {
      // Audio is optional; typing must work even when the browser blocks it.
    }
  }, [enabled]);

  return { enabled, play, toggle };
}
