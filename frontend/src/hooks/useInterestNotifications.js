import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../services/api';

const STORAGE_KEY = 'admin_last_seen_interests';
const POLL_INTERVAL = 15000; // 15 seconds

// Simple beep using Web Audio API - no external file needed
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Two-tone chime
    const playNote = (freq, startTime, duration) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      oscillator.start(ctx.currentTime + startTime);
      oscillator.stop(ctx.currentTime + startTime + duration);
    };
    playNote(880, 0, 0.15);
    playNote(1174, 0.12, 0.2);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // Audio blocked; silently ignore
  }
};

export const useInterestNotifications = (enabled) => {
  const [count, setCount] = useState(0);
  const [latest, setLatest] = useState(null);
  const [newItems, setNewItems] = useState([]);
  const prevIdsRef = useRef(null);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const items = await adminApi.getInterests();
        if (cancelled) return;

        setCount(items.length);
        setLatest(items[0] || null);

        const currentIds = new Set(items.map((i) => i.id));

        // First load: initialize baseline
        if (prevIdsRef.current === null) {
          const lastSeen = localStorage.getItem(STORAGE_KEY);
          if (lastSeen) {
            try {
              const seenIds = new Set(JSON.parse(lastSeen));
              const unseenItems = items.filter((it) => !seenIds.has(it.id));
              setNewItems(unseenItems);
            } catch {
              setNewItems(items);
            }
          } else {
            // First time ever: show all existing as unseen so admin can review the queue
            setNewItems(items);
          }
          prevIdsRef.current = currentIds;
          return;
        }

        // Find truly new items (ids not in prev set)
        const newlyArrived = items.filter((it) => !prevIdsRef.current.has(it.id));
        if (newlyArrived.length > 0) {
          setNewItems((prev) => {
            const merged = [...newlyArrived, ...prev];
            // Dedupe by id
            const seen = new Set();
            return merged.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
          });
          if (soundEnabledRef.current) playBeep();
        }
        prevIdsRef.current = currentIds;
      } catch (e) {
        // Silent fail; auth interceptor will handle 401
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled]);

  const markAllSeen = () => {
    setNewItems([]);
    const ids = prevIdsRef.current ? Array.from(prevIdsRef.current) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  };

  const setSoundEnabled = (v) => { soundEnabledRef.current = v; };

  return { count, latest, newItems, unseenCount: newItems.length, markAllSeen, setSoundEnabled };
};
