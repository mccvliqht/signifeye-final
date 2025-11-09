import { GestureDescription, Finger, FingerCurl, FingerDirection } from 'fingerpose';

// Additional FSL phrases (static approximations for browser-based demos)

export const fslStop = new GestureDescription('Stop');
fslStop.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslStop.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslStop.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslStop.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslStop.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
fslStop.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.9);

export const fslWater = new GestureDescription('Water');
fslWater.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslWater.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslWater.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslWater.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const fslBathroom = new GestureDescription('Bathroom');
fslBathroom.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslBathroom.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslBathroom.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslBathroom.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslBathroom.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const fslEat = new GestureDescription('Eat');
fslEat.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslEat.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslEat.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslEat.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
fslEat.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

export const fslDrink = new GestureDescription('Drink');
fslDrink.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslDrink.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
fslDrink.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.0);
fslDrink.addCurl(Finger.Ring, FingerCurl.HalfCurl, 1.0);
fslDrink.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1.0);

export const fslInternet = new GestureDescription('Internet');
fslInternet.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslInternet.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslInternet.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslInternet.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

export const fslComputer = new GestureDescription('Computer');
fslComputer.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslComputer.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslComputer.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslComputer.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const fslPhone = new GestureDescription('Phone');
fslPhone.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslPhone.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
fslPhone.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslPhone.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslPhone.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);

export const fslBook = new GestureDescription('Book');
fslBook.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslBook.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslBook.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslBook.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

export const fslHome = new GestureDescription('Home');
fslHome.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
fslHome.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
fslHome.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
fslHome.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export const fslSchool = new GestureDescription('School');
fslSchool.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslSchool.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fslSchool.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fslSchool.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);

export const fslTeacher = new GestureDescription('Teacher');
fslTeacher.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslTeacher.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);

export const fslStudent = new GestureDescription('Student');
fslStudent.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslStudent.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);

export const fslExcuseMe = new GestureDescription('Excuse me');
fslExcuseMe.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
fslExcuseMe.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);

export const fslYoureWelcome = new GestureDescription("You're welcome");
fslYoureWelcome.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fslYoureWelcome.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);

export const fslWhat = new GestureDescription('What');
fslWhat.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fslWhat.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);

export const fslWhere = new GestureDescription('Where');
fslWhere.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);

export const fslPhrases = [
  fslStop,
  fslWater,
  fslBathroom,
  fslEat,
  fslDrink,
  fslInternet,
  fslComputer,
  fslPhone,
  fslBook,
  fslHome,
  fslSchool,
  fslTeacher,
  fslStudent,
  fslExcuseMe,
  fslYoureWelcome,
  fslWhat,
  fslWhere,
];