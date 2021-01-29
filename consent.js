
// Keeps track whether or not consent has been given.
let consent_given = false;

/*
 * This fragment of html will be displayed in the beginning of you experiment.
 * You should fillout the contents of your information letter here.
 * It is displayed as html, the current html should be replace with
 * your information letter.
 */
const CONSENT_HTML = 
    '<p>' +
        'Insert your information letter here; for more information, see the '  +
        '<a href="https://fetc-gw.wp.hum.uu.nl/en/" target="_blank"> '         +
            'FEtC-H website'                                                   +
        '</a>'                                                                 +
    '</p>';

/*
 * Debrieving given when the participant doesn't consent.
 */
const DEBRIEF_MESSAGE_NO_CONSENT = 
    "<h1>"                                          +
        "End of the experiment"                     +
    "</h1>"                                         +
    "<h2>"                                          +
        "No consent has been given."                +
    "</h2>";

const CONSENT_STATEMENT = 
    'Yes, I consent to the use of my answers for scientific research.';

const CONSENT_REFERENCE_NAME = 'consent';
const IF_REQUIRED_FEEDBACK_MESSAGE = 
    "You must check the box next to " + CONSENT_STATEMENT +
    "in order to proceed to the experiment.";

// Adds UU styling to the consent forms.
const CONSENT_HTML_STYLE_UU = `<style>
        body {
            background: rgb(246, 246, 246);
            font-family: "Open Sans","Frutiger",Helvetica,Arial,sans-serif;
            color: rgb(33, 37, 41);
            text-align: left;
        }

        p {
            line-height: 1.4; /* Override paragraph for better readability */
        }

        label {
            margin-bottom: 0;
        }

        h1, h2{
            font-size: 2rem;
        }

        h6 {
            font-size: 1.1rem;
        }

        /* Input styles */

        form > table th {
            padding-left: 10px;
            vertical-align: middle;
        }

        input, textarea, select {
            border-radius: 0;
            border: 1px solid #d7d7d7;
            padding: 5px 10px;
            line-height: 20px;
            font-size: 16px;
        }

        input[type=submit], input[type=button], button, .button, .jspsych-btn {
            background: #000;
            color: #fff;
            border: none;
            font-weight: bold;
            font-size: 15px;
            padding: 0 20px;
            line-height: 42px;
            width: auto;
            min-width: auto;
            cursor: pointer;
            display: inline-block;
            border-radius: 0;
        }

        input[type="checkbox"], input[type="radio"]
        {
            width: auto;
        }

        button[type=submit], input[type=submit], .button-colored {
            background: #ffcd00;
            color: #000000;
        }

        button[type=submit].button-black, input[type=submit].button-black {
            background: #000;
            color: #fff;
        }

        button a, .button a,
        button a:hover, .button a:hover,
        a.button, a.button:hover {
            color: #fff;
            text-decoration: none;
        }

        .button-colored a,
        .button-colored a:hover,
        a.button-colored,
        a.button-colored:hover {
            color: #000;
        }

        /* Table styles */
        table thead th {
            border-bottom: 1px solid #ccc;
        }

        table tfoot th {
            border-top: 1px solid #ccc;
        }

        table tbody tr:nth-of-type(odd) {
            background: #eee;
        }

        table tbody tr:hover {
            background: #ddd;
        }

        table tbody tr.no-background:hover, table tbody tr.no-background {
            background: transparent;
        }

        table tbody td, table thead th, table tfoot th {
            padding: 6px 5px;
        }

        /* Link styles */
        a {
            color: rgb(33, 37, 41);
            text-decoration: underline;
            transition: 0.2s ease color;
        }

        a:hover {
            transition: 0.2s ease color;
            color: rgb(85, 85, 95);
        }

        </style>
        `;

// displays the informed consent page
let consent_block = {
    type: 'survey-multi-select',
    data : {uil_save : true},
    preamble: CONSENT_HTML_STYLE_UU + CONSENT_HTML,
    required_message: IF_REQUIRED_FEEDBACK_MESSAGE,
    questions: [
        {
            prompt: "", 
            options: [CONSENT_STATEMENT], 
            horizontal: true,
            required: false,  
            button_label: CONTINUE_BUTTON_TEXT,
            name: CONSENT_REFERENCE_NAME
        }
    ],
    on_finish: function(data){
        let consent_choice = data.responses;   
        data.consent_choice_response = consent_choice;
    }
};

/**
 * Obtains the consent of the participant.
 *
 * @returns {string}
 */
function getConsentData()
{
    let data = jsPsych.data.get().select('consent_choice_response');
    console.log(data);
    let consent_trial_data = JSON.parse(data.values[0]);
    return consent_trial_data.consent;
}

// Is displayed when no consent has been given.
let no_consent_end_screen = {
    type: 'html-button-response',
    stimulus: DEBRIEF_MESSAGE_NO_CONSENT,
    choices: [],
    trial_duration: FINISH_TEXT_DUR,
    on_finish: function (data){
        jsPsych.endExperiment()
    }
};

// Tests wheter consent has been given.
// If no consent has been given It displays the
// no_consent_screen.
//
let if_node_consent = {
    timeline: [no_consent_end_screen],
    conditional_function: function(data) {
        let mydata = getConsentData();
        if (mydata == CONSENT_STATEMENT) {
            consent_given = true;
            return false;
        } else {
            return true;
        }
    }
}

let consent_procedure = {
    timeline: [consent_block, if_node_consent]
}

