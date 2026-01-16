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

// --- 4. YES (Dominant Fist, Thumb Can Be Bent) ---
export const YesGesture = new fp.GestureDescription('Yes');

// Strong fist
[fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky].forEach(finger => {
  YesGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
});

// Thumb: bent = YES
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);

// Straight thumb should NOT be YES
YesGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 0.0);

// 🚫 DO NOT block directions for YES
// Let score win naturally

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

// --- 6. GOOD (Strict Thumbs Up, Stable) ---
export const GoodGesture = new fp.GestureDescription('Good');

// Thumb MUST be straight
GoodGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);

// Bent thumb weakens GOOD but does NOT nuke it
GoodGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.1);
GoodGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 0.0);

// Thumb prefers vertical
GoodGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 0.9);

// Other fingers in fist
[fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky].forEach(finger => {
  GoodGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
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

// --- 8. PEACE (Victory Sign) ✌️ ---
export const PeaceGesture = new fp.GestureDescription('Peace');

// Index & Middle: Straight Up (V-Shape)
PeaceGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
PeaceGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);
PeaceGesture.addDirection(fp.Finger.Index, fp.FingerDirection.DiagonalUpLeft, 0.9);
PeaceGesture.addDirection(fp.Finger.Index, fp.FingerDirection.DiagonalUpRight, 0.9);

PeaceGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
PeaceGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.VerticalUp, 1.0);
PeaceGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.DiagonalUpLeft, 0.9);
PeaceGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.DiagonalUpRight, 0.9);

// Ring, Pinky, Thumb: Curled
[fp.Finger.Thumb, fp.Finger.Ring, fp.Finger.Pinky].forEach((finger) => {
    PeaceGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    PeaceGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9); // Allow slight looseness
});

/*
// --- 9-11. OPEN HAND (Base for Father, Mother, Fine) 🖐️ ---
// Ito ang gagamitin nating base shape.
export const OpenHandGesture = new fp.GestureDescription('OpenHand');

// All fingers open and pointing up
for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    OpenHandGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    OpenHandGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
    // Allow slight spread
    OpenHandGesture.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 0.5);
    OpenHandGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 0.5);
}
*/

// --- 12. CALL ME (Y-Shape) 🤙 ---
export const CallGesture = new fp.GestureDescription('Call Me');
CallGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
CallGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
[fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring].forEach((finger) => {
    CallGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
});

// --- 13. DRINK (C-Shape) 🥤 ---
export const DrinkGesture = new fp.GestureDescription('Drink');
[fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring].forEach((finger) => {
    DrinkGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 1.0);
    DrinkGesture.addCurl(finger, fp.FingerCurl.NoCurl, 0.5); // Allow loose C
});
DrinkGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 0.5);
DrinkGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 0.5);

/*

// --- 14-16. POINT (Index Only) - Base for You / Me / Think 👈 ---
export const PointGesture = new fp.GestureDescription('Point');
PointGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
[fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky].forEach((finger) => {
    PointGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
});
// Thumb can be tucked or loose
PointGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
PointGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 0.8);

// --- 17. FLAT HAND (B-Hand) - For "Please" 🙏 ---
// Iba ito sa OpenHand. Dito dapat magkakadikit (o straight) lahat.
export const FlatHandGesture = new fp.GestureDescription('FlatHand');
for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    FlatHandGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}
// Note: Sa Fingerpose, mahirap idistinguish ang Open vs Flat, 
// kaya gagamitin natin ang POSITION logic para sigurado.

// --- 18. FIST (A-Hand) -  Sorry ✊ ---
// (Reuse FistGesture or YesGesture logic)
export const FistGesture = new fp.GestureDescription('Fist');
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    FistGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);

}*/
  