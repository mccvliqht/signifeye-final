// src/lib/CustomGestures.ts
import * as fp from 'fingerpose';

// --- 1. I Love You ---
export const ILYGesture = new fp.GestureDescription('I love you');
ILYGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);

// --- 2. Hello (STRICT Version) ---
export const HelloGesture = new fp.GestureDescription('Hello');
for (let finger of [
  fp.Finger.Thumb,
  fp.Finger.Index,
  fp.Finger.Middle,
  fp.Finger.Ring,
  fp.Finger.Pinky,
]) {
  // Hello MUST have all fingers perfectly straight
  HelloGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

// --- 3. WAIT (Strict Thumb Version) ---
export const WaitGesture = new fp.GestureDescription('Wait');

// Index finger: MUST be straight up
WaitGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
WaitGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);

// Thumb: MUST be curled and tucked (This stops the 'L' confusion)
// If the thumb is NoCurl (extended), this gesture score will drop to 0
WaitGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
WaitGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.4); 

// Middle, Ring, Pinky: MUST be curled
for(let finger of [fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    WaitGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}
