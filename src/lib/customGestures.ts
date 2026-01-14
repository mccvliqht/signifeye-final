// src/lib/CustomGestures.ts
import * as fp from 'fingerpose';

// --- 1. I Love You ---
export const ILYGesture = new fp.GestureDescription('I love you');
ILYGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);

// --- 2. Hello ---
export const HelloGesture = new fp.GestureDescription('Hello');
for (let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
  HelloGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

// --- 3. WAIT (Index Up, Thumb Tucked) ---
export const WaitGesture = new fp.GestureDescription('Wait a minute');
WaitGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
WaitGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);
WaitGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
WaitGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.4); 
for(let finger of [fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    WaitGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}

// --- 4. YES (Fist + Orientation) ---
export const YesGesture = new fp.GestureDescription('Yes');
// All fingers except thumb are fully curled
for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
  YesGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}
// Thumb tucked over or across
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.5);
// Adding direction helps distinguish this from 'A' or 'S'
YesGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 0.8);

// --- 5. NO (The Beak Shape - Improved) ---
export const NoGesture = new fp.GestureDescription('No');

// Index and Middle fingers: Half-curled to meet the thumb
[fp.Finger.Index, fp.Finger.Middle].forEach((finger) => {
  NoGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 1.0);
  // Allow a tiny bit of FullCurl in case the fingers touch tightly
  NoGesture.addCurl(finger, fp.FingerCurl.FullCurl, 0.4); 
});

// Thumb: Must be extended (NoCurl) or slightly curved to meet fingers
NoGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
NoGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.6);

// Ring and Pinky: MUST be fully curled away
[fp.Finger.Ring, fp.Finger.Pinky].forEach((finger) => {
  NoGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
});

// Orientation: Ensure the "beak" is pointing forward or slightly up
NoGesture.addDirection(fp.Finger.Index, fp.FingerDirection.Forward, 1.0);
NoGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.VerticalUp, 0.5);