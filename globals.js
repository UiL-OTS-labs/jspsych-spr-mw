
// IMPORTANT
// Access key, this must be modified.
// You get this id when you have requested an experiment on
// the data storage server.
// If you do not fill out a valid key, the participants
// browser will not be able to upload the data to the server.
// Replace this by a PERFECT COPY of the key from the data server.
const ACCESS_KEY = '00000000-0000-0000-0000-000000000000';

// This defines the dimensions of the canvas on which
// the sentences are drawn. Keep in mind, that you'll exclude
// participants with a low resolutions when you set this to
// high.
const MIN_WIDTH =  1000;
const MIN_HEIGHT = 600;

// The ISI will be added after each trial/stimulus 
const ISI = 500; //ms

// Fragments of text to display on buttons
const YES_BUTTON_TEST = "yes"
const NO_BUTTON_TEST = "no"
const OK_BUTTON_TEXT = "ok";
const TRUE_BUTTON_TEXT = "true";
const FALSE_BUTTON_TEXT = "false";

// Duration of the fixation cross.
const FIX_DUR = 500;

// The duration in ms for howlong the finished instruction
// is on screen.
const FINISH_TEXT_DUR = 3000;

// If no grouping character is selected or null as in this example
// every word is a group of its own. And no 
// Grouping character if none sentences are split on whitespace
// each word will be a one word group
// const GROUPING_STRING = null;

// Or create groups based on a splitting string
// Create groups based on a "/" Notices every occurence
// of a "/" will be used as group and will be removed from
// the stimulus
 const GROUPING_STRING = "/";

