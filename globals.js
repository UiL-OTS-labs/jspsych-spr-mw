
// IMPORTANT
// Access key, this must be modified.
// You will get this id when you have requested an experiment on
// the data storage server.
// If you do not fill out a valid key, the participant's
// browser will not be able to upload the data to the server.
// Replace this by a PERFECT COPY of the key from the data server.
const ACCESS_KEY = '00000000-0000-0000-0000-000000000000';

//RANDOMIZATION

// Whether or not to pseudorandomize the test items
const PSEUDO_RANDOMIZE = true;
// The maximum number of items with a similar itemtype in a row
const MAX_SUCCEEDING_ITEMS_OF_TYPE = 2

// This defines the dimensions of the canvas on which
// the sentences are drawn. Keep in mind, that you'll exclude
// participants with a low screen resolution when you set this too
// high.
const MIN_WIDTH = 1000;
const MIN_HEIGHT = 600;

// The ISI will be added after each trial/stimulus
const ISI = 500; //ms

// Fragments of text to display on buttons
const YES_BUTTON_TEST = "yes"
const NO_BUTTON_TEST = "no"
const OK_BUTTON_TEXT = "ok";
const TRUE_BUTTON_TEXT = "true";
const FALSE_BUTTON_TEXT = "false";
const CONTINUE_BUTTON_TEXT = "continue";

// Duration of the fixation cross.
const FIX_DUR = -1;
// The buttons to terminate presentation of the fix cross
const FIX_CHOICES = [32]; // 32 == " " a spacebar to continue

// The duration in ms for how long the finished instruction
// is on screen.
const FINISH_TEXT_DUR = 3000;

// If no grouping character is selected or if it is null as in this example
// every word is a group of its own: sentences are split on whitespace.
// each word will be a one word group
const GROUPING_STRING = null;
// Or create word groups based on a splitting string
// Create groups using a "/". Note that every occurrence
// of a "/" will lead to presentation as a word group and the a "/" itself
// will not be displayed in the stimulus
//const GROUPING_STRING = "/";

