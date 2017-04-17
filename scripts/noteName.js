/*
include file to have access to a the pitchName function,
which takes in a frequency as a float, and returns the musical
name of the note along with it's register.
*/
let A = "A";
let As = "A#/Bb";
let B = "B";
let C = "C";
let Cs = "C#/Db";
let D = "D";
let Ds = "D#/Eb";
let E = "E";
let F = "F";
let Fs = "F#/Gb";
let G = "G";
let Gs = "G#/Ab";

let half_step = Math.pow(2.0,1.0/12.0);
let cents = Math.pow(2.0,1.0/1200.0);
let A0 = 27.5;//below human hearing threshold


function pitchName(freq){
	var lower_bound;
	var upper_bound;
	var offsetName;

	
	var i = Math.floor(12 * Math.log2(freq/A0));
	lower_bound = A0 * Math.pow(half_step,i);	
	upper_bound = A0 * Math.pow(half_step,i + 1);
	
	offset = findCents(lower_bound,upper_bound,freq);
	var offsetName = " ".concat(offset.toString()).concat("c");

	if(offset < 0){
		i++;//the frequency is closer to the note above in this case
	}

	//find register name as a string
	var register = (i/12).toString();
	var note = i % 12;//determine which note is played, regardless of register
	var name = "";
	switch(note){//constructs the name as a string
		case 0:
			name.concat(A).concat(register);
			break;
		case 1:
			name.concat(As).concat(register);
			break;
		case 2:
			name.concat(B).concat(register);
			break;
		case 3:
			name.concat(C).concat(register);
			break;
		case 4:
			name.concat(Cs).concat(register);
			break;
		case 5:
			name.concat(D).concat(register);
			break;
		case 6:
			name.concat(Ds).concat(register);
			break;
		case 7:
			name.concat(E).concat(register);
			break;
		case 8:
			name.concat(F).concat(register);
			break;
		case 9:
			name.concat(Fs).concat(register);
			break;
		case 10:
			name.concat(G).concat(register);
			break;
		case 11:
			name.concat(Gs).concat(register);
			break;
	}
	name.concat(offsetName);//adds offset in form of cents to the name	
	return name;//example, "C#/Db4 -13c"
}

/*
Helper function that returns the offset from a given note
*/
function findCents(lower_bound,upper_bound,realValue){
	var i = 0;
	for(i = 0; i < 50; i++){
		if(realValue < lower_bound * Math.pow(cents,i)){
			break;//keep value the same to indicate closest note is below the given pitch
		}
		if(realFalue > upper_bound / Math.pow(cents,i)){
			i = -i;//flip value to indicate the closest note is above the given pitch
			break;
		}		
	}
	
	return i;	
}
