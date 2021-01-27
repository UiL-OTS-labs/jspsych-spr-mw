
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
    <input type="text" id="native_language" name="native_language"
        pattern="[a-zA-Z]+" placeholder="Dutch" required>
    <span class="validity"></span>
    <br> 
    <br> 
    `;

const survey_1 = {
    type :      'survey-html-form',
    data: {
        uil_save : true,
        survey_data_flag: true
    },
    preamble :  AGE_PROMPT,
    html :      AGE_HTML,

    // flatten json output
    on_finish : function(data) {
        let responses = JSON.parse(data.responses);
        Object.keys(responses).forEach(
            function (key) {
                if (key in data) {
                    console.warn("Oops overwriting existing key in data");
                }
                data[key] = responses[key];
            }
        );
        delete data.responses;
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
    type: 'survey-multi-choice',
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
        let responses = JSON.parse(data.responses);
        Object.keys(responses).forEach(
            function (key) {
                if (key in data) {
                    console.warn("Oops overwriting existing key in data");
                }
                data[key] = responses[key];
            }
        );
        delete data.responses;
    }
};

let survey_review = {
    type: "html-button-response",
    stimulus: function(data){

        let survey_1_data= 
            jsPsych.data.get().last(2).values()[0]; //former
        
        let survey_2_data = 
            jsPsych.data.get().last(1).values()[0];
        
        let b_year = survey_1_data.birth_year;
        let b_month = survey_1_data.birth_month;
        let n_lang = survey_1_data.native_language;

        let bilingual = survey_2_data.Multilingual;
        let dyslexic = survey_2_data.Dyslexic;
        let sex = survey_2_data.Sex;
        let hand_pref = survey_2_data.HandPreference;

        return `
            <h1>Your data</h1>

            <div><strong>Birth year</strong>: ${b_year} </div>
            <div><strong>Birth month</strong>: ${b_month} </div>
            <div><strong>Native language</strong>: ${n_lang} </div>
            <div><strong>Multilingual</strong>: ${bilingual} </div>
            <div><strong>Dyslexic</strong>: ${dyslexic} </div>
            <div><strong>Sex</strong>: ${sex} </div>
            <div><strong>Hand preference</strong>: ${hand_pref} </div>

            <BR><BR>
            <p>Is this information correct?</p>
            `;
    },
    choices: [TRUE_BUTTON_TEXT, FALSE_BUTTON_TEXT],
    response_ends_trial: true,
    on_finish: function(data){
        // Repeat the survey if true (0) was not pressed
        repeat_survey = data.button_pressed != 0;
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

