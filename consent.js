
// Replace this text with some custon html of your own. You should
// end
const CONSENT_HTML =
    "<p>"                                                      +
        "Some small amount of text to display on the screen. " +
        "If you can read this, you would like to update this " +
        "in consent.js.<br>"                                   +
        "Do you consent with the terms above?"                 +
    "</p>";

const POS_CONSENT = "Yes, I consent";
const NEG_CONSENT = "No, I do not consent";

const consent_choices = [POS_CONSENT, NEG_CONSENT];

// Global variable that determines whether consent
// has been given.
consent_given = false;

// A simple trial, the participant chooses to comply with the consent hopefully
// if not, the experiment is ended and no data will be stored.
let consent_trial = {
    type : 'html-button-response',
    stimulus : CONSENT_HTML,
    choices : consent_choices,
    on_finish : function (data) {
        var nth_button = data.button_pressed;
        if (nth_button != 0) {
            jsPsych.endExperiment();
        } else {
            consent_given = true;
        }
        data.consent_given = consent_given;
    }
};
