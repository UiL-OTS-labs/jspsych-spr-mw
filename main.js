const KEY_CODE_SPACE = 32;
const G_QUESTION_CHOICES = [FALSE_BUTTON_TEXT, TRUE_BUTTON_TEXT];

let welcome_screen = {
    type : 'html-keyboard-response',
    stimulus : WELCOME_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let instruction_screen_practice = {
    type : 'html-keyboard-response',
    stimulus : PRE_PRACTICE_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let fixcross = {
    type : 'spr-moving-window',
    stimulus : '+',
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
    type : 'spr-moving-window',
    stimulus : jsPsych.timelineVariable('stimulus'),
    background_color : "rgb(230, 230, 230)", // light gray
    font_color : "rgb(0, 0, 0)", // black
    font_family : "Times New Roman",
    font_size : 36,
    width : MIN_WIDTH,
    height : MIN_HEIGHT,
    post_trial_gap : ISI,
    grouping_string : GROUPING_STRING,
    data : {
        id : jsPsych.timelineVariable('id'),
        item_type : jsPsych.timelineVariable('item_type'),
        uil_save : true
    }
}

let question = {
    type : 'html-button-response',
    stimulus : jsPsych.timelineVariable('question'),
    choices : G_QUESTION_CHOICES,
    data : {
        id : jsPsych.timelineVariable('id'),
        item_type : "Q" + jsPsych.timelineVariable('item_type'),
        expected_answer : jsPsych.timelineVariable('qanswer'),
        uil_save : true
    },
    on_finish: function (data) {
        let choice = G_QUESTION_CHOICES[data.button_pressed];
        data.answer = choice;
        data.correct = choice === data.expected_answer;
        data.integer_correct = data.correct ? 1 : 0;
        data.rt = Math.round(data.rt);
    }
};

let maybe_question = {
    timeline: [ question ],
    conditional_function: function() {
        let q = jsPsych.timelineVariable('question')();
        return typeof(q) !== 'undefined' && q.length > 0;
    }
};

let end_practice_screen = {
    type : 'html-keyboard-response',
    stimulus : PRE_TEST_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let end_experiment = {
    type : 'html-keyboard-response',
    stimulus : POST_TEST_INSTRUCTION,
    choices : [],
    trial_duration : FINISH_TEXT_DUR,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
}

function getTimeline(stimuli) {
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

    let test = {
        timeline: [
            fixcross,
            present_text,
            maybe_question
        ],
        timeline_variables: stimuli.table
    }

    timeline.push(test);
    timeline.push(end_experiment);
    return timeline;
}


function main() {

    // Option 1: client side randomization:
    let stimuli = pickRandomList();
    kickOffExperiment(stimuli, getTimeline(stimuli));

    // Option 2: server side balancing:
    // Make sure you have matched your groups on the dataserver with the
    // lists in stimuli.js..
    // This experiment uses groups/lists list1, and list2 by default (see
    // stimuli.js).
    // Hence, unless you change lists here, you should created matching
    // groups there.
    // uil.session.start(ACCESS_KEY, (group_name) => {
    //     let stimuli = findList(group_name);
    //     kickOffExperiment(stimuli);
    // });
}

window.addEventListener (
    'load',
    main
);
