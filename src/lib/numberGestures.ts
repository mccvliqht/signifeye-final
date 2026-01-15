import * as fp from 'fingerpose';

// --- Numbers 1-5 ---

export const OneGesture = new fp.GestureDescription('1');
OneGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
OneGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);
for(let finger of [fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky, fp.Finger.Thumb]) {
    OneGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}

export const TwoGesture = new fp.GestureDescription('2');
TwoGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
TwoGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
for(let finger of [fp.Finger.Ring, fp.Finger.Pinky, fp.Finger.Thumb]) {
    TwoGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}

export const ThreeGesture = new fp.GestureDescription('3');
ThreeGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
ThreeGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
ThreeGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
for(let finger of [fp.Finger.Ring, fp.Finger.Pinky]) {
    ThreeGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}

export const FourGesture = new fp.GestureDescription('4');
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    FourGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}
FourGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);

export const FiveGesture = new fp.GestureDescription('5');
for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    FiveGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

// --- Numbers 6-10 ---

export const SixGesture = new fp.GestureDescription('6');
SixGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 1.0);
SixGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring]) {
    SixGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

export const SevenGesture = new fp.GestureDescription('7');
SevenGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 1.0);
SevenGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Pinky]) {
    SevenGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

export const EightGesture = new fp.GestureDescription('8');
EightGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.HalfCurl, 1.0);
EightGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
for(let finger of [fp.Finger.Index, fp.Finger.Ring, fp.Finger.Pinky]) {
    EightGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

export const NineGesture = new fp.GestureDescription('9');
NineGesture.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 1.0);
NineGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
for(let finger of [fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    NineGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
}

export const TenGesture = new fp.GestureDescription('10');
TenGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
TenGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 1.0);
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    TenGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
}

// Export as a single array for easy use in the estimator
export const NumberGestures = [
    OneGesture, TwoGesture, ThreeGesture, FourGesture, FiveGesture,
    SixGesture, SevenGesture, EightGesture, NineGesture, TenGesture
];