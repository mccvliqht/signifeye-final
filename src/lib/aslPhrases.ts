import { GestureDescription, Finger, FingerCurl, FingerDirection } from 'fingerpose';

// Additional ASL phrases (static approximations using handshapes)
// Note: Many phrases are movement-based in true ASL. These are static proxies
// commonly used in browser demos with MediaPipe + fingerpose.

export const aslStop = new GestureDescription('Stop');
aslStop.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aslStop.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslStop.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
aslStop.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
aslStop.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
aslStop.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);

export const aslWater = new GestureDescription('Water');
aslWater.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aslWater.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslWater.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
aslWater.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
aslWater.addCurl(Finger.Pinky, FingerCurl.FullCurl, 0.9); // approximates 'W'

export const aslBathroom = new GestureDescription('Bathroom');
aslBathroom.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aslBathroom.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aslBathroom.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
aslBathroom.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aslBathroom.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0); // approximates 'T'

export const aslEat = new GestureDescription('Eat');
aslEat.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
aslEat.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
aslEat.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
aslEat.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
aslEat.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

export const aslDrink = new GestureDescription('Drink');
aslDrink.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
aslDrink.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
aslDrink.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
aslDrink.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
aslDrink.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

export const aslInternet = new GestureDescription('Internet');
aslInternet.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslInternet.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
aslInternet.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
aslInternet.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

export const aslComputer = new GestureDescription('Computer');
aslComputer.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslComputer.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
aslComputer.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
aslComputer.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const aslPhone = new GestureDescription('Phone');
aslPhone.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aslPhone.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
aslPhone.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aslPhone.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aslPhone.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);

export const aslBook = new GestureDescription('Book');
aslBook.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslBook.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
aslBook.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
aslBook.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

export const aslHome = new GestureDescription('Home');
aslHome.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
aslHome.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
aslHome.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
aslHome.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const aslSchool = new GestureDescription('School');
aslSchool.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslSchool.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
aslSchool.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
aslSchool.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

export const aslTeacher = new GestureDescription('Teacher');
aslTeacher.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslTeacher.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);

export const aslStudent = new GestureDescription('Student');
aslStudent.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslStudent.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);

export const aslExcuseMe = new GestureDescription('Excuse me');
aslExcuseMe.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
aslExcuseMe.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);

export const aslYoureWelcome = new GestureDescription("You're welcome");
aslYoureWelcome.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aslYoureWelcome.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);

export const aslWhat = new GestureDescription('What');
aslWhat.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
aslWhat.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);

export const aslWhere = new GestureDescription('Where');
aslWhere.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);

export const aslPhrases = [
  aslStop,
  aslWater,
  aslBathroom,
  aslEat,
  aslDrink,
  aslInternet,
  aslComputer,
  aslPhone,
  aslBook,
  aslHome,
  aslSchool,
  aslTeacher,
  aslStudent,
  aslExcuseMe,
  aslYoureWelcome,
  aslWhat,
  aslWhere,
];