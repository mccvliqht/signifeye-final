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

// --- 4. YES (Solid Fist) ---
export const YesGesture = new fp.GestureDescription('Yes');
// All fingers MUST be fully curled
for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
  YesGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}
// 🛠️ FIX: Strictly require Thumb to be tucked
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.5);
// 🛠️ FIX: Explicitly forbid an extended thumb for "Yes"
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 0.0);

// --- 5. NO (Beak / Pinch Shape) ---
export const NoGesture = new fp.GestureDescription('No');

// Index and Middle: MUST be Half-Curled (Curving to meet thumb)
[fp.Finger.Index, fp.Finger.Middle].forEach((finger) => {
  NoGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 1.0);
  // Strictly avoid FullCurl to prevent it being seen as a 'Yes' fist
  NoGesture.addCurl(finger, fp.FingerCurl.FullCurl, 0.0); 
});

// Thumb: Must be extended (NoCurl) to meet the fingers
NoGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
NoGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.5);

// Ring and Pinky: MUST stay tucked (FullCurl)
[fp.Finger.Ring, fp.Finger.Pinky].forEach((finger) => {
  NoGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
});

// Direction: Pointing the "beak" forward helps distinguish the landmarks
NoGesture.addDirection(fp.Finger.Index, fp.FingerDirection.Forward, 1.0);

// --- 6. GOOD (Thumbs Up) ---
export const GoodGesture = new fp.GestureDescription('Good');

// 🛠️ THUMB MUST BE "REALLY STRAIGHT": 
// We use NoCurl with a weight of 1.0 and strictly avoid HalfCurl/FullCurl
GoodGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
GoodGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 0.0);
GoodGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.0);

// 🛠️ DIRECTIONAL LOCK: Thumb must be pointing straight up
GoodGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 1.0);

// All other fingers MUST be a solid fist (FullCurl)
[fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky].forEach((finger) => {
  GoodGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
  // Prevent these fingers from being seen as "NoCurl" (like in the letter B)
  GoodGesture.addCurl(finger, fp.FingerCurl.NoCurl, 0.0);
});

// --- 7. WATER (W-Shape) ---
export const WaterGesture = new fp.GestureDescription('Water');
// Index, Middle, and Ring fingers are extended
[fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring].forEach((finger) => {
  WaterGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
});
// Pinky and Thumb are curled
[fp.Finger.Pinky, fp.Finger.Thumb].forEach((finger) => {
  WaterGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
});