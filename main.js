import {
    sprMovingWindow,
    checkStimuliSyntax
} from 'https://web-experiments.lab.hum.uu.nl/jspsych/plugins/spr-mw/1.0/jspsych-spr-moving-window.js'

let jsPsych = initJsPsych({
    exclusions: {
        min_width : MIN_WIDTH,
        min_height : MIN_HEIGHT
    }
});

// export jsPsych globally because this is a module now...
// or export jsPsych and import it from the other files.
window.jsPsych = jsPsych

 // I liked RandomError too :-)
class SprRandomizationError extends Error {
    constructor(message) {
        super(message);
        this.name = SprRandomizationError;
    }
}

const KEY_CODE_SPACE = ' ';
const G_QUESTION_CHOICES = [FALSE_BUTTON_TEXT, TRUE_BUTTON_TEXT];

let welcome_screen = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : WELCOME_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let instruction_screen_practice = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : PRE_PRACTICE_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let fixcross = {
    type : sprMovingWindow,
    stimulus : '{{+}}',
    choices : FIX_CHOICES,
    font_family : "Times New Roman",
    font_size : 36,
    width : MIN_WIDTH,
    height : MIN_HEIGHT,
    trial_duration : FIX_DUR,
    data : {
        id : jsPsych.timelineVariable('id'),
        item_type : 'FIX_CROSS',
        uil_save : false
    }
};

let present_text = {
    type : sprMovingWindow,
    stimulus : jsPsych.timelineVariable('stimulus'),
    background_color : "rgb(230, 230, 230)", // light gray
    font_color : "rgb(0, 0, 0)", // black
    font_family : "Times New Roman",
    font_size : 36,
    width : MIN_WIDTH,
    height : MIN_HEIGHT,
    post_trial_gap : ISI,
    data : {
        id : jsPsych.timelineVariable('id'),
        item_type : jsPsych.timelineVariable('item_type'),
        uil_save : true
    }
}

let question = {
    type : jsPsychHtmlButtonResponse,
    stimulus : jsPsych.timelineVariable('question'),
    choices : G_QUESTION_CHOICES,
    data : {
        id : jsPsych.timelineVariable('id'),
        item_type : ()  => 'Q' + jsPsych.timelineVariable('item_type'),
        expected_answer : jsPsych.timelineVariable('qanswer'),
        uil_save : true
    },
    on_finish: function (data) {
        let choice = G_QUESTION_CHOICES[data.response];
        data.answer = choice;
        data.correct = choice === data.expected_answer;
        data.integer_correct = data.correct ? 1 : 0;
        data.rt = Math.round(data.rt);
    }
};

let maybe_question = {
    timeline: [ question ],
    conditional_function: function() {
        let q = jsPsych.timelineVariable('question');
        return typeof(q) !== 'undefined' && q.length > 0;
    }
};

let end_practice_screen = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : PRE_TEST_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let feedback_screen = {
    type: jsPsychSurveyText,
    preamble: FEEDBACK_PREAMBLE,
    promise_task_data: undefined,
    promise_feedback_data: undefined,
    questions: [
        {prompt: FEEDBACK_PROMPT, rows: 5},
    ],
    on_load: function () {
        if (consent_given) {
            feedback_screen.promise_task_data = uil.saveJson(
                jsPsych.data.get().json(), ACCESS_KEY
            );
        }
        else {
            document.body.innerHTML = FINISHED_NO_CONSENT;
        }
    },
    on_finish: function(data) {
        let payload = {
            feedback: data.response,
            ...jsPsych.data.dataProperties // adds subject id and list info
        };
        feedback_screen.promise_feedback_data = uil.saveJson(
            JSON.stringify(payload), ACCESS_KEY
        );
        Promise.all([this.promise_task_data, this.promise_feedback_data])
            .then(() => {
                jsPsych.finishTrial();
                console.log("finished")
            }
        );
    }
};

let end_experiment = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : POST_TEST_INSTRUCTION,
    choices : [],
}

/**
 * Randomize a table of stimuli
 */
function randomizeStimuli(table) {
    let shuffled = uil.randomization.randomizeStimuli(
        table,
        MAX_SUCCEEDING_ITEMS_OF_TYPE
    );

    if (shuffled !== null)
        table = shuffled;
    else {
        console.error('Unable to shuffle stimuli according to the set constraints.');
        let msg = "Unable to shuffle the stimuli, perhaps loosen the " +
                  "constraints, or check the item_types on the stimuli.";
        throw new SprRandomizationError(msg);
    }

    return table; // shuffled table if possible original otherwise
}

/**
 * Get the timeline for a table of stimuli
 */
function getTimeline(table) {
    //////////////// timeline /////////////////////////////////
    let timeline = [];

    // Welcome the participant and guide them through the
    // consent forms and survey.
    timeline.push(welcome_screen);

    // Obtain informed consent.
    timeline.push(consent_procedure);

    // add survey
    timeline.push(survey_procedure);

    // Add the different parts of the experiment to the timeline
    timeline.push(instruction_screen_practice);

    let practice = {
        timeline: [
            fixcross,
            present_text,
            maybe_question
        ],
        timeline_variables: PRACTICE_ITEMS
    };

    timeline.push(practice);
    timeline.push(end_practice_screen);

    if (PSEUDO_RANDOMIZE) {
        table = randomizeStimuli(table);
    }

    let test = {
        timeline: [
            fixcross,
            present_text,
            maybe_question
        ],
        timeline_variables: table
    }

    timeline.push(test);
    timeline.push(feedback_screen);
    timeline.push(end_experiment);
    return timeline;
}


function main() {
    // Make sure you have updated your key in globals.js
    uil.setAccessKey(ACCESS_KEY);
    uil.stopIfExperimentClosed();

    // Option 1: client side randomization:
    let stimuli = pickRandomList();
    checkStimuliSyntax(PRACTICE_ITEMS);
    checkStimuliSyntax(stimuli.table);
    kickOffExperiment(getTimeline(stimuli.table), stimuli.list_name);

    // Option 2: server side balancing:
    // Make sure you have matched your groups on the dataserver with the
    // lists in stimuli.js..
    // This experiment uses groups/lists list1, and list2 by default (see
    // stimuli.js).
    // Hence, unless you change lists here, you should created matching
    // groups there.
    // uil.session.start(ACCESS_KEY, (group_name) => {
    //     let stimuli = findList(group_name);
    //     kickOffExperiment(getTimeline(stimuli.table), stimuli.list_name);
    // });
}



// this function will eventually run the jsPsych timeline
function kickOffExperiment(timeline, list_name) {

    let subject_id = uil.session.isActive() ?
        uil.session.subjectId() : jsPsych.randomization.randomID(8);

    // data one would like to add to __all__ trials, according to:
    // https://www.jspsych.org/overview/data/
    jsPsych.data.addProperties (
        {
            subject : subject_id,
            list : list_name,
        }
    );

    // Start jsPsych when running on a Desktop or Laptop style pc.
    uil.browser.rejectMobileOrTablet();
    jsPsych.run(timeline);
}

/**
 * This function will pick a random list from the TEST_ITEMS array.
 *
 * Returns an object with a list and a table, the list will always indicate
 * which list has been chosen for the participant.
 *
 * @returns {object} object with list_name and table fields
 */
function pickRandomList() {
    let range = function (n) {
        let empty_array = [];
        let i;
        for (i = 0; i < n; i++) {
            empty_array.push(i);
        }
        return empty_array;
    }
    let num_lists = TEST_ITEMS.length;
    var shuffled_range = jsPsych.randomization.repeat(range(num_lists), 1)
    var retlist = TEST_ITEMS[shuffled_range[0]];
    return retlist
}

function findList(name) {
    let list = TEST_ITEMS.find((entry) => entry.list_name === name);
    if (!list) {
        let found = TEST_ITEMS.map((entry) => `"${entry.list_name}"`).join(', ');
        console.error(
            `List not found "${name}".\n` +
                'This name was configured on the UiL datastore server.\n' +
                `The following lists exist in stimuli.js: \n${found}`)
    }
    return list;
}

// start the experiment
window.addEventListener('load', main);
