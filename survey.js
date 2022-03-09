
// global repeat boolean
// If the survey is filled out incorrectly the questionaire
// is repeated.
let repeat_survey = false;

// 1th survey question

const AGE_PROMPT = "<p>Please fill out the forms below</p>";
const AGE_HTML = `
    <label for="birth_year">In what year were you born? </label>
    <input type="number" id="birth_year"
        name="birth_year" placeholder=1999 min=1919 max=2019 required>
    <span class="validity"></span>

    <br>
    <br>

    <label for="birth_month">In what month were you born? </label>
    <input type="number" id="birth_month" name="birth_month"
        placeholder=7 min=1 max=12 required>
    <span class="validity"></span>

    <br>
    <br>

    <label for="native_language">What is your native language?</label>
    <input type="text" id="native_language" name="native_language" placeholder="Dutch" required>
    <span class="validity"></span>
    <br>
    <br>
    `;

const survey_1 = {
    type :      jsPsychSurveyHtmlForm,
    data: {
        uil_save : true,
        survey_data_flag: true
    },
    preamble :  AGE_PROMPT,
    html :      AGE_HTML,
    button_label : CONTINUE_BUTTON_TEXT,

    on_finish : function(data) {
        data.rt = Math.round(data.rt);
    }
};


// 2nd survey question

const BILINGUAL_QUESTION = `
    Were you born and raised in a
    <a href="https://en.wikipedia.org/wiki/Multilingualism" target="_blank">multilingual</a>
    environment?
    `;

const BILINGUAL_OPTIONS = ["No","Yes"];

const DYSLEXIC_QUESTION = `Are you
    <a href="https://en.wikipedia.org/wiki/Dyslexia" target="_blank">dyslexic</a>?
    `;
const DYSLEXIC_OPTIONS = ["No", "Yes"];

const SEX_QUESTION = `
    What is your
    <a href="https://en.wikipedia.org/wiki/Sex" target="_blank">biological sex</a>?
    `;
const SEX_OPTIONS = ["Female", "Male", "Other", "Prefer not to say"];

const HAND_QUESTION = 'Which hand do you prefer to write with?';
const HAND_OPTIONS = ["Left", "Right"];

const survey_2 = {
    type: jsPsychSurveyMultiChoice,
    button_label: CONTINUE_BUTTON_TEXT,
    data: {
        uil_save : true,
        survey_data_flag : true
    },
    questions: [
        {
            prompt : BILINGUAL_QUESTION,
            name : 'Multilingual',
            options : BILINGUAL_OPTIONS,
            required :true,
            horizontal : true
        },
        {
            prompt : DYSLEXIC_QUESTION,
            name : 'Dyslexic',
            options : DYSLEXIC_OPTIONS,
            required : true,
            horizontal : true
        },
        {
            prompt : SEX_QUESTION,
            name : 'Sex',
            options : SEX_OPTIONS,
            required : true,
            horizontal : true
        },
        {
            prompt : HAND_QUESTION,
            name : 'HandPreference',
            options : HAND_OPTIONS,
            required : true,
            horizontal : true
        }
    ],

    on_finish: function(data){
        data.rt = Math.round(data.rt);
    }
};

let survey_review = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(data){

        let survey_1 =
            jsPsych.data.get().last(2).values()[0].response;

        let survey_2 =
            jsPsych.data.get().last(1).values()[0].response;

        let b_year = survey_1.birth_year;
        let b_month = survey_1.birth_month;
        let n_lang = survey_1.native_language;

        let bilingual = survey_2.Multilingual;
        let dyslexic = survey_2.Dyslexic;
        let sex = survey_2.Sex;
        let hand_pref = survey_2.HandPreference;

        return `
            <h1>Your responses</h1>

            <div><strong>Birth year</strong>: ${b_year} </div>
            <div><strong>Birth month</strong>: ${b_month} </div>
            <div><strong>Native language</strong>: ${n_lang} </div>
            <div><strong>Multilingual</strong>: ${bilingual} </div>
            <div><strong>Dyslexic</strong>: ${dyslexic} </div>
            <div><strong>Sex</strong>: ${sex} </div>
            <div><strong>Hand preference</strong>: ${hand_pref} </div>

            <br><br>
            <p>Is this information correct?</p>
            `;
    },
    choices: [TRUE_BUTTON_TEXT, FALSE_BUTTON_TEXT],
    response_ends_trial: true,
    on_finish: function(data){
        // Repeat the survey if true (0) was not pressed
        repeat_survey = data.response !== 0;
        data.rt = Math.round(data.rt);
    }
};

let survey_procedure = {
    timeline : [
        survey_1,
        survey_2,
        survey_review
    ],
    loop_function : function () {
        if (repeat_survey) {
            // clear last trials of the survey
            let collection = jsPsych.data.get();
            let trials = collection.values();
            trials.length = trials.length - this.timeline.length;
        }
        return repeat_survey;
    }
};
