// src/lib/CustomGestures.ts
import * as fp from 'fingerpose';

// --- 1. I Love You (Stays the same) ---
export const ILYGesture = new fp.GestureDescription('I love you');
ILYGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);

// --- 2. Hello (STRICT Version to stop confusion) ---
export const HelloGesture = new fp.GestureDescription('Hello');
for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    // Hello MUST have all fingers perfectly straight (NoCurl)
    HelloGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

// --- 3. No (INSTANT Version) ---
export const NoGesture = new fp.GestureDescription('No');

// We allow Index and Middle to be EITHER straight or half-curled.
// This makes the recognition start the millisecond you move.
NoGesture.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 1.0);
NoGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 0.8); 

NoGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.HalfCurl, 1.0);
NoGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 0.8);

NoGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);

// CRITICAL: Ring and Pinky MUST be curled.
// This is what tells the model "This is NOT Hello"
NoGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
NoGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);