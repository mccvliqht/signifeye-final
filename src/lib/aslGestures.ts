import { GestureDescription, Finger, FingerCurl, FingerDirection } from 'fingerpose';

// ASL Gesture Definitions for A-Z
// Based on American Sign Language alphabet handshapes

// Letter A: Closed fist with thumb on the side
export const aGesture = new GestureDescription('A');
aGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
aGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// Letter B: Flat hand, fingers together pointing up
export const bGesture = new GestureDescription('B');
bGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
bGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
bGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
bGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
bGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
bGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
bGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);

// Letter C: Curved hand forming a 'C'
export const cGesture = new GestureDescription('C');
cGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
cGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

// Letter D: Index finger up, other fingers touching thumb
export const dGesture = new GestureDescription('D');
dGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
dGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
dGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
dGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// Letter E: All fingers curled into palm
export const eGesture = new GestureDescription('E');
eGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.9);
eGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
eGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// Letter F: OK sign - index and thumb touching, others extended
export const fGesture = new GestureDescription('F');
fGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
fGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);

// Letter G: Index and thumb parallel, pointing horizontally
export const gGesture = new GestureDescription('G');
gGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
gGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
gGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
gGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.7);
gGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.7);

// Letter H: Index and middle fingers extended horizontally
export const hGesture = new GestureDescription('H');
hGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
hGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
hGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
hGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
hGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.7);
hGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.7);

// Letter I: Pinky finger extended
export const iGesture = new GestureDescription('I');
iGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
iGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
iGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);

// Letter K: Index and middle up, thumb between them
export const kGesture = new GestureDescription('K');
kGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
kGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
kGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
kGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
kGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.7);
kGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.7);

// Letter L: L-shape with thumb and index
export const lGesture = new GestureDescription('L');
lGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
lGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
lGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
lGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.7);
lGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.7);
lGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

// Letter M: Three fingers over thumb
export const mGesture = new GestureDescription('M');
mGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
mGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
mGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
mGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
mGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// Letter N: Two fingers over thumb
export const nGesture = new GestureDescription('N');
nGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
nGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
nGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
nGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
nGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// Letter O: All fingers touching to form circle
export const oGesture = new GestureDescription('O');
oGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
oGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

// Letter P: K but pointing down
export const pGesture = new GestureDescription('P');
pGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
pGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
pGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
pGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
pGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.7);
pGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.7);

// Letter Q: G but pointing down
export const qGesture = new GestureDescription('Q');
qGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
qGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
qGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
qGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
qGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
qGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 0.7);
qGesture.addDirection(Finger.Index, FingerDirection.DiagonalDownRight, 0.7);

// Letter R: Index and middle crossed
export const rGesture = new GestureDescription('R');
rGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
rGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
rGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
rGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
rGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);
rGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.9);

// Letter S: Fist with thumb across fingers
export const sGesture = new GestureDescription('S');
sGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
sGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
sGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// Letter T: Thumb between index and middle
export const tGesture = new GestureDescription('T');
tGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
tGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
tGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
tGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

// Letter U: Index and middle together pointing up
export const uGesture = new GestureDescription('U');
uGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
uGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
uGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
uGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
uGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
uGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);

// Letter V: Peace sign - index and middle apart
export const vGesture = new GestureDescription('V');
vGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
vGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
vGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
vGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
vGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
vGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);

// Letter W: Three fingers up
export const wGesture = new GestureDescription('W');
wGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
wGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
wGesture.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
wGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
wGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
wGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
wGesture.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);

// Letter X: Hook finger
export const xGesture = new GestureDescription('X');
xGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
xGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
xGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
xGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
xGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.8);

// Letter Y: Thumb and pinky extended (shaka/hang loose)
export const yGesture = new GestureDescription('Y');
yGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
yGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
yGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

// Letter Z: Index pointing, making Z motion (we'll use pointing gesture)
export const zGesture = new GestureDescription('Z');
zGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
zGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
zGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
zGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
zGesture.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.7);
zGesture.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.7);

// Letter J: Similar to I but with motion (we'll use I pointing down)
export const jGesture = new GestureDescription('J');
jGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
jGesture.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
jGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
jGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
jGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

// Alphabet only - no phrases
const aslAlphabet = {
  aGesture, bGesture, cGesture, dGesture, eGesture,
  fGesture, gGesture, hGesture, iGesture, jGesture, kGesture,
  lGesture, mGesture, nGesture, oGesture, pGesture,
  qGesture, rGesture, sGesture, tGesture, uGesture,
  vGesture, wGesture, xGesture, yGesture, zGesture
};

export const aslGestures = Object.values(aslAlphabet);
