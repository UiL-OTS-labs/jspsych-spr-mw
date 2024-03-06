
// global repeat boolean
// If the survey is filled out incorrectly the questionaire
// is repeated.
let repeat_survey = false;

// 1th survey question


const survey_1 = {
    type: IlsSurveyPlugin,
    fields: {
        birth_year: {label: 'Birth year'},
        birth_month: {label: 'Month'},
        native_language: {label: 'Native language'},
    },
    html: `
    <h4>Please answer some questions</h4>
    <div style="text-align: left">
	<p>In what year were you born?</p>
	<div>
            <input type="number" name="birth_year" required>
	</div>
	<p>In what month were you born?</p>
	<div>
            <input type="number" name="birth_month" required>
	</div>
	<p>What is your native language?</p>
	<div>
            <input type="text" name="native_language" required>
	</div>
    </div>
    <div style="margin: 20px">
        <button class="jspsych-btn">Continue</button>
    </div>
    `,
    exclusion: function(data) {
        // return true when participant should be excluded

        let currentYear = (new Date()).getFullYear();
        let age = currentYear - parseInt(data.birth_year, 10);

        // reject participants younger than 18
        if (age < 18) {
            return true;
        }

        // reject participants older than 80
        if (age > 80) {
            return true;
        }

        // accept participant otherwise
        return false
    },
};

// 2nd survey question

const survey_2 = {
    type: IlsSurveyPlugin,
    fields: {
        multilingual: {
            label: 'Multilingual environment',
            options: {
                yes: "Yes",
                no: "No"}
        },
        dyslexia: {
            label: 'Dyslexia',
            options: {
                yes: "Yes",
                no: "No"}
        },
        handedness: {
            label: 'Handedness',
            options: {
                right: "Right",
                left: "Left"}
        },
        sex: {
            label: 'Biological sex',
            options: {
                male: "Male",
                female: "Female",
                other: "Other",
                unspecified: "Unspecified"}
        },
    },
    exclusion: function(data) {
        // return true when participant should be excluded
        if (data.dyslexia == 'yes') {
            return true;
        }
        // accept participant otherwise
        return false
    },
    html: `
    <div style="text-align: left">
        <p>Were you born and raised in a multilingual environment?</p>
        <label><input type="radio" name="multilingual" value="yes" required/>Yes</label>
        <label><input type="radio" name="multilingual" value="no" required/>No</label>

    <p>Which hand do you prefer to write with?
            <span class="info-toggle"></span>
            <span class="info">
                We ask this because left or right handedness (the hand you primarily write with) is associated with
                differences in the brain, which could also influence how the brain handles language. Most studies therefore
                report at the group level how many left and right-handed people participated in a study. Sometimes the
                results are also analyzed per group. For tasks measuring reaction time, we may also ask you to give a
                certain response with your dominant hand.
            </span>
        </p>
    <div>
        <label><input type="radio" name="handedness" value="right" required/>Right</label>
        <label><input type="radio" name="handedness" value="left" required/>Left</label>
    </div>

        <p>What is your biological sex?
            <span class="info-toggle"></span>
            <span class="info">
                We ask this because sex hormones influence the development and functioning of the brain, and may also
                influence how the brain deals with language. Most studies therefore report at the group level how many
                biological males and how many biological females participated. Sometimes the results are also analyzed
                per group. You do not have to share your biological sex with us, but it is useful for our reports if you
                do.
            </span>
        </p>
    <div>
        <label><input type="radio" name="sex" value="male" required/>Male</label>
        <label><input type="radio" name="sex" value="female" required/>Female</label>
        <label><input type="radio" name="sex" value="other" required/>Other</label>
        <label><input type="radio" name="sex" value="unspecified" required/>Prefer not to say</label>
    </div>

    <p>Are you dyslexic?
            <span class="info-toggle"></span>
        <span class="info">
        We ask this because dyslexia affects how the brain processes language (including spoken language).
        </span>
    </p>
    <div>
        <label><input type="radio" name="dyslexia" value="yes" required/>Yes</label>
        <label><input type="radio" name="dyslexia" value="no" required/>No</label>
    </div>
    </div>
    <div style="margin: 20px">
        <button class="jspsych-btn">Continue</button>
    </div>
    `
};

let survey_procedure = {
    timeline : [
        survey_1,
        survey_2,
    ]
};
