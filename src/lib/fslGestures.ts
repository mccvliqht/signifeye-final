import { GestureDescription, Finger, FingerCurl, FingerDirection } from 'fingerpose';

// Filipino Sign Language (FSL) Gesture Definitions
// FSL shares similarities with ASL but has unique variations

// FSL Letter A: Similar to ASL
export const fslA = new GestureDescription('A');
fslA.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslA.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslA.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslA.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslA.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter B: Flat hand
export const fslB = new GestureDescription('B');
fslB.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslB.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslB.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslB.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslB.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

// FSL Letter C
export const fslC = new GestureDescription('C');
fslC.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslC.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslC.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslC.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
fslC.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

// FSL Letter D
export const fslD = new GestureDescription('D');
fslD.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslD.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslD.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslD.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslD.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// FSL Letter E
export const fslE = new GestureDescription('E');
fslE.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
fslE.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslE.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslE.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslE.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter F
export const fslF = new GestureDescription('F');
fslF.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslF.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslF.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslF.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslF.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

// FSL Letter G
export const fslG = new GestureDescription('G');
fslG.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslG.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslG.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslG.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslG.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter H
export const fslH = new GestureDescription('H');
fslH.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslH.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslH.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslH.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter I
export const fslI = new GestureDescription('I');
fslI.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslI.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslI.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslI.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslI.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

// FSL Letter J: Similar movement-based, using I as base
export const fslJ = new GestureDescription('J');
fslJ.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
fslJ.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslJ.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslJ.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);

// FSL Letter K
export const fslK = new GestureDescription('K');
fslK.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslK.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslK.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslK.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter L
export const fslL = new GestureDescription('L');
fslL.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslL.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslL.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslL.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslL.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslL.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// FSL Letter M
export const fslM = new GestureDescription('M');
fslM.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslM.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslM.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslM.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
fslM.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter N
export const fslN = new GestureDescription('N');
fslN.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslN.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslN.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslN.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslN.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter O
export const fslO = new GestureDescription('O');
fslO.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslO.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslO.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslO.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
fslO.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

// FSL Letter P
export const fslP = new GestureDescription('P');
fslP.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslP.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslP.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslP.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslP.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.7);
fslP.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.7);

// FSL Letter Q
export const fslQ = new GestureDescription('Q');
fslQ.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslQ.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslQ.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslQ.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslQ.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslQ.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.7);

// FSL Letter R
export const fslR = new GestureDescription('R');
fslR.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslR.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslR.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslR.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslR.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);

// FSL Letter S
export const fslS = new GestureDescription('S');
fslS.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslS.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslS.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslS.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslS.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter T
export const fslT = new GestureDescription('T');
fslT.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
fslT.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslT.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslT.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslT.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// FSL Letter U
export const fslU = new GestureDescription('U');
fslU.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslU.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslU.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslU.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslU.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// FSL Letter V
export const fslV = new GestureDescription('V');
fslV.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslV.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslV.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslV.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslV.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// FSL Letter W
export const fslW = new GestureDescription('W');
fslW.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslW.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslW.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslW.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslW.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// FSL Letter X
export const fslX = new GestureDescription('X');
fslX.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslX.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslX.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslX.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
fslX.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);

// FSL Letter Y
export const fslY = new GestureDescription('Y');
fslY.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslY.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslY.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslY.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslY.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

// FSL Letter Z: Movement-based but using hook finger as base
export const fslZ = new GestureDescription('Z');
fslZ.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslZ.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslZ.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslZ.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// Alphabet only - no phrases
const fslAlphabet = {
  fslA, fslB, fslC, fslD, fslE, fslF, fslG, fslH, fslI, fslJ,
  fslK, fslL, fslM, fslN, fslO, fslP, fslQ, fslR, fslS, fslT,
  fslU, fslV, fslW, fslX, fslY, fslZ
};

export const fslGestures = Object.values(fslAlphabet);
