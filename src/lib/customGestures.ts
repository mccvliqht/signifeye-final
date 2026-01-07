// src/lib/CustomGestures.ts
import * as fp from 'fingerpose';

// --- 1. Define "I Love You" ---
export const ILYGesture = new fp.GestureDescription('I love you');

// Thumb: Extended
ILYGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
// Index: Extended
ILYGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
// Pinky: Extended
ILYGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
// Middle & Ring: Curled
ILYGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
ILYGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);

// --- 2. Define "Hello" (More Forgiving version) ---
export const HelloGesture = new fp.GestureDescription('Hello');

for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    HelloGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    
    // Add multiple directions so it works even if the hand is tilted
    HelloGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
    HelloGesture.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 0.9);
    HelloGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 0.9);
}