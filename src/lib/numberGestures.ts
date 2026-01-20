import * as fp from 'fingerpose';

import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

// --- NUMBER 0 ---
export const ZeroGesture = new GestureDescription('0');
ZeroGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
ZeroGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.5);
ZeroGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 0.5);
ZeroGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
ZeroGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
ZeroGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- NUMBER 1 ---
export const OneGesture = new GestureDescription('1');
OneGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
OneGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
OneGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8); // Allow slight loose thumb
OneGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
OneGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
OneGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- NUMBER 2 ---
export const TwoGesture = new GestureDescription('2');
TwoGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
TwoGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
TwoGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
TwoGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);
TwoGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
TwoGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- NUMBER 3 ---
export const ThreeGesture = new GestureDescription('3');
ThreeGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
ThreeGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
ThreeGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
ThreeGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
ThreeGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// --- NUMBER 4 (THE FIX IS HERE) ---
export const FourGesture = new GestureDescription('4');
FourGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
FourGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
FourGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
FourGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
// Fix: Allow thumb to be FullCurl (strict) OR HalfCurl (lenient)
// Minsan kasi hindi super tago ang thumb natin pag nagfo-four
FourGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0); 
FourGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9); 

// --- NUMBER 5 (Adjusted to avoid conflict with 4) ---
export const FiveGesture = new GestureDescription('5');
for (let finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    FiveGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
}
// Strict rule: Thumb MUST be straight for 5, to distinguish from 4
FiveGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.5);
FiveGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
FiveGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);


// --- NUMBER 6 ---
export const SixGesture = new GestureDescription('6');
SixGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
SixGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
SixGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
SixGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
SixGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0); // Touching pinky

// --- NUMBER 7 ---
export const SevenGesture = new GestureDescription('7');
SevenGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
SevenGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
SevenGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
SevenGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0); // Touching ring
SevenGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0); // Touching ring

// --- NUMBER 8 ---
export const EightGesture = new GestureDescription('8');
EightGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
EightGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
EightGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
EightGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0); // Touching middle
EightGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0); // Touching middle

// --- NUMBER 9 ---
export const NineGesture = new GestureDescription('9');
NineGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
NineGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
NineGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
NineGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0); // Touching index
NineGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0); // Touching index


export const TenGesture = new fp.GestureDescription('10');
TenGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
TenGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 1.0);
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    TenGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}

// Export as a single array for easy use in the estimator
export const AllNumberGestures = [
    OneGesture, TwoGesture, ThreeGesture, FourGesture, FiveGesture,
    SixGesture, SevenGesture, EightGesture, NineGesture, TenGesture
];