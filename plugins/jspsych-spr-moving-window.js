var sprMovingWindow = (function(jspsych) {

    const SPR_MW_PLUGIN_NAME = 'spr-moving-window';

    const info = {
        name: SPR_MW_PLUGIN_NAME,
        parameters : {
            stimulus : {
                type :          jspsych.ParameterType.STRING,
                pretty_name :   'Stimulus',
                default :       undefined,
                description :   'The string to be displayed in' +
                    'Self paced reading moving window style'
            },
            trial_duration : {
                type :          jspsych.ParameterType.FLOAT,
                pretty_name :   "The maximum stimulus duration",
                default :       -1,
                description :   "The maximum amount of time a trial lasts." +
                    "if the timer expires, only the recorded words " +
                    "will have a valid reactiontime. If the value  " +
                    "is no trial terminate timer will be set."
            },
            choices : {
                type :          jspsych.ParameterType.KEYCODE,
                pretty_name :   "Choices",
                default :       [' '],
                description :   "The keys allowed to advance a word."
            },
            background_color : {
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "Background color",
                default :       "rgb(230,230,230)",
                description :   "background_color r, g and b value as javascript object such as: " +
                    "\"rgb(230,230,230)\" or \"gray\""
            },
            font_color : {
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "Font color",
                default :       'rgb(0,0,0)',
                description :   "The rgb values in which the letters will be presented, such as: " +
                    "rgb(0,0,0)"
            },
            font_family : {
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "The familiy of the font that is used to draw the words.",
                default :       "Times New Roman",
                description :   "The final font will be computed from the family, and font size"
            },
            font_size : {
                type :          jspsych.ParameterType.INT,
                pretty_name :   "The size of the font.",
                default :       36,
                description :   "The final font will be computed from the family, and font size"
            },
            width : {
                type :          jspsych.ParameterType.INT,
                pretty_name :   "width",
                default :       900,
                description :   "The width of the canvas in which the spr moving window is presented."
            },
            height : {
                type :          jspsych.ParameterType.INT,
                pretty_name :   "height",
                default :       600,
                description :   "The height of the canvas in which the spr moving window is presented"
            },
            grouping_string : {
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "grouping string",
                default :       null,
                description :   "The string used to split the string in to parts. The parts are "  +
                    "presented together. This allows to present multiple words as "    +
                    "group if the argument isn't specified every single word is "      +
                    "treated as group. You should make sure that the used argument "   +
                    "doesn't appear at other locations than at boundaries of groups, " +
                    "because the grouping character is removed from the string. a "    +
                    "'/' can be used quite handy for example."
            },
            line_height_multiplier : {
                type :          jspsych.ParameterType.FLOAT,
                pretty_name :   "line_height_multiplier",
                default:        1.5,
                description :   "You can increase/decrease the vertical line distance between " +
                                "consecutive lines. When it is one, the line more or less touch " +
                                "each other."

            },
        }
    };
    // Reused names
    const SPR_CANVAS = "SprCanvas";

    // Reused regular expressions.
    //
    // \p{} is for a unicode property
    // \p{L} matches a "alfabetic" character throughout languages.
    // see https://javascript.info/regexp-unicode
    const CAP_WORD = '(\\p{L}+)';

    // Caputure as word if it is precisely a word.
    const WORD = '^\\p{L}+$';
    const NUMBER = '^[0-9]+$';
    const NEWLINE = '\n';
    const WHITE_SPACE = '\\s';
    const CAP_WHITE_SPACE = '(\\s)';
    const INTERPUNCTION = "\\p{P}";
    const WORD_INTERPUNCTION= "^\\p{L}+\\p{P}$";

    const RE_CAP_WORD = RegExp(CAP_WORD, 'u');
    const RE_WORD = RegExp(WORD, 'u');
    const RE_NUMBER = RegExp(NUMBER, 'u');
    const RE_NEWLINE = RegExp(NEWLINE, 'u');
    const RE_WHITE_SPACE = RegExp(WHITE_SPACE, 'u');
    const RE_CAP_WHITE_SPACE = RegExp(CAP_WHITE_SPACE, 'u');
    const RE_INTERPUNCTION = RegExp(INTERPUNCTION, 'u');
    const RE_WORD_INTERPUNCTION= RegExp(WORD_INTERPUNCTION, 'u');

    /**
     * Creates a range between [start, end).
     *
     * @param start The value at which the range starts
     * @param end   The value before which the range stops.
     *
     * @return an array with the range.
     */
    function range(start, end, step = 1) {
        let a = []
        if (step > 0) {
            for (let i = start; i < end; i++)
                a.push(i);
        } else if(step < 0) {
            for (let i =  start; i > end; i++)
                a.push(i);
        } else {
            throw RangeError(
                "Argument 3 (the step) must be larger or smaller than 0."
            );
        }
        return a;
    }

    /**
     * Class to represent the position of a word on a 2d canvas
     */
    class Pos {
        /**
         * @param {number} x the x position of a word
         * @param {number} y the y position of a word
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    };

    /**
     * Class to contain some data about a word, on how to present it
     * on a canvas.
     */
    class TextInfo {

        /**
         * @param {string} txt, the text to draw at ctx
         * @param {Pos} position the position at which to draw text.
         * @param {CanvasRenderingContext2D} ctx the 2d drawing position.
         */
        constructor(text, position, ctx) {
            if (typeof(text) !== "string")
                console.error("TextInfo constructor text was not a String");
            if (!position instanceof Pos)
                console.error("TextInfo constructor position was not a Pos");
            if (!ctx instanceof CanvasRenderingContext2D)
                console.error("TextInfo constructor cts was not a valid "+
                              "CanvasRenderingContext2D");
            this.text = text;
            this.pos = position;
            this.ctx = ctx
            this.metrics = ctx.measureText(this.text);
        }

        drawText() {
            this.ctx.fillText(this.text, this.pos.x, this.pos.y);
        }

        drawUnderline() {
            this.ctx.beginPath();
            this.ctx.moveTo(this.pos.x, this.pos.y);
            this.ctx.lineTo(this.pos.x + this.metrics.width, this.pos.y);
            this.ctx.stroke();
        }

        isWhiteSpace() {
            return this.text.match(/^\s+$/u) !== null;
        }

        isWord() {
            return this.text.match(RE_WORD) !== null;
        }

        isNumber() {
            return this.text.match(RE_NUMBER) !== null;
        }

        isWordPlusInterpunction() {
            return this.text.match(RE_WORD_INTERPUNCTION) !== null;
        }

        width() {
            return this.metrics.width;
        }
    };

    /**
     * Class to obtain useful information about words
     * that should be presented in a group
     */
    class GroupInfo {
        /**
         * @param indices {Array.<number>} Indices of the words to be
         *                                 presented in this group
         * @param record {bool}            A boolean whether or not
         *                                 the rt of this group
         *                                 should be recorded.
         */
        constructor(indices, record) {
            this.indices = indices;
            this.record = record;
        }
    };

    // private variables

    let group_index = 0;        // the nth_word that should be presented.
    let words = [];             // array of TextInfo.
    let old_html = "";          // the current display html, in order to
                                // restore it when finished.
    let font = "";              // family of the font with px size
    let background_color = "";  // the color of the paper of the text.
    let font_color = "";        // the color of the text.
    let ctx = null;             // 2D drawing context
    let gwidth = 0;             // width of the canvas
    let gheight = 0;            // and the height.
    let valid_keys = null;      // the valid keys or choices for a response
    let gelement = null;        // the element we get from jsPsych.
    let reactiontimes = [];     // store for relevant reactiontimes.
    let groups = [];            // store groups of indices of words
    // to be presented together.

    /**
     * Setup the variables for use at the start of a new trial
     */
    function setupVariables(display_element, trial_pars) {
        // reset state.
        group_index     = 0;
        words           = [];
        ctx             = null;

        font = `${trial_pars.font_size}px ${trial_pars.font_family}`;
        old_html = display_element.innerHTML;
        background_color = trial_pars.background_color;
        font_color = trial_pars.font_color;
        gwidth = trial_pars.width;
        gheight = trial_pars.height;
        valid_keys = trial_pars.choices;
        gelement = display_element;
        reactiontimes = [];
        groups = [];

        createCanvas(display_element, trial_pars);
        ctx.font = font;
        let stimulus = trial_pars.stimulus;
        if (trial_pars.grouping_string) {
            grouping_re = RegExp(trial_pars.grouping_string, 'ug');
            groups = createGroups(stimulus, grouping_re);
            stimulus = stimulus.replace(grouping_re, "");
        }
        else {
            groups = createGroups(stimulus, RE_WHITE_SPACE);
        }
        stimulus = stimulus.replace(RegExp("#", 'gu'), "");
        let lines = stimulus.split(RE_NEWLINE);
        gatherWordInfo(lines, trial_pars);
    }

    /**
     * Create groups of words that are presented together
     * @param {String} stim the stimulus to be presented
     * @param {RegExp} split_re
     */
    function createGroups(stim, split_re) {

        /**
         * Splits text into tokens and discards empty strings. The
         * tokens are defined by the regular expression used to
         * split the string.
         *
         * @param {String} text The text to splint into tokens
         * @param {RegExp} re   The regular expression used to split the string
         *
         * @return An array of strings as tokens.
         */
        function splitIntoTokens(text, re) {
            return text.split(re).filter (
                function(word) {
                    return word != "";
                }
            );
        };

        let nwordstotal = splitIntoTokens(stim, RE_WHITE_SPACE).length;
        let word_indices = range(0, nwordstotal);
        let groups = splitIntoTokens(stim, split_re);
        let group_indices = [];

        for (let nthgroup = 0; nthgroup < groups.length; nthgroup++) {
            let record = groups[nthgroup].trim()[0] == "#";
            let nwordsgroup = splitIntoTokens(
                groups[nthgroup],
                RE_WHITE_SPACE
            ).length;
            let indices = word_indices.slice(0, nwordsgroup);
            word_indices = word_indices.slice(nwordsgroup);
            group_indices.push(new GroupInfo(indices, record));
        }
        console.assert(
            word_indices.length == 0,
            "Oops it was expected that word_indices was empty by now."
        );
        return group_indices;
    }

    /**
     * Setup the canvas for use with this plugin
     *
     * @param {HTMLElement} display_element
     * @param {Object} trial Object with trial information
     */
    function createCanvas(display_element, trial_pars) {
        let canvas = document.createElement('canvas')
        canvas.setAttribute("width", trial_pars.width);
        canvas.setAttribute("height", trial_pars.height);
        canvas.setAttribute("id", SPR_CANVAS);
        display_element.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    /**
     * Processes the lines, it "measures" where each word should be.
     * the output is stored in the global plugin variable words.
     */
    function gatherWordInfo(lines, trial_pars) {

        let delta_y = determineLineHeight(
            trial_pars.font_family,
            trial_pars.font_size,
        ) * trial_pars.line_height_multiplier;
        // We could add this to the trial_pars.
        let y = delta_y;
        let word = 0;
        const BASE_Y = delta_y; // The height on which lines begin.
        const BASE_X = determineLineHeight(trial_pars.font_family, trial_pars.font_size);

        for (let line = 0; line < lines.length; line++) {
            liney = BASE_Y + line * delta_y;
            fragments = lines[line].split(RE_CAP_WHITE_SPACE);
            fragments = fragments.filter( word => {return word != "";});
            let runningx = BASE_X;
            for (let fragment = 0; fragment < fragments.length; fragment++) {
                let current_fragment = fragments[fragment];
                let pos = new Pos(runningx, liney);
                let current_word = new TextInfo(current_fragment, pos, ctx);
                if (!current_word.isWhiteSpace())
                    words.push(current_word);
                runningx += current_word.width();
            }
        }
    }

    /**
     * Draws the stimulus on the canvas.
     */
    function drawStimulus() {

        // draw background
        ctx.fillStyle = background_color;
        ctx.fillRect(0, 0, gwidth, gheight);

        // draw text
        ctx.fillStyle = font_color;
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            for (let j = 0; j < group.indices.length; j++) {
                let word = words[group.indices[j]];
                if (i === group_index) {
                    word.drawText();
                }
                else {
                    word.drawUnderline();
                }
            }
        }
    }

    function installResponse(trial_pars) {
        jsPsych.pluginAPI.getKeyboardResponse(
            {
                callback_function : afterResponse,
                valid_responses : valid_keys,
                rt_method : 'performance',
                persist : false, // We reinstall the response, because
                // otherwise the rt is cumulative.
                allow_held_key: false
            }
        );
    }

    function finish() {

        let data = {
            rt1  : -1,
            rt2  : -1,
            rt3  : -1,
            rt4  : -1,
            rt5  : -1,
            rt6  : -1,
            rt7  : -1,
            rt8  : -1,
            rt9  : -1,
            rt10 : -1,
            rt11 : -1,
            rt12 : -1,
            rt13 : -1,
            rt14 : -1,
            rt15 : -1,
        }

        if (reactiontimes.length > 0)
            data.rt1 = Math.round(reactiontimes[0]);
        if (reactiontimes.length > 1)
            data.rt2 = Math.round(reactiontimes[1]);
        if (reactiontimes.length > 2)
            data.rt3 = Math.round(reactiontimes[2]);
        if (reactiontimes.length > 3)
            data.rt4 = Math.round(reactiontimes[3]);
        if (reactiontimes.length > 4)
            data.rt5 = Math.round(reactiontimes[4]);
        if (reactiontimes.length > 5)
            data.rt6 = Math.round(reactiontimes[5]);
        if (reactiontimes.length > 6)
            data.rt7 = Math.round(reactiontimes[6]);
        if (reactiontimes.length > 7)
            data.rt8 = Math.round(reactiontimes[7]);
        if (reactiontimes.length > 8)
            data.rt9 = Math.round(reactiontimes[8]);
        if (reactiontimes.length > 9)
            data.rt10 = Math.round(reactiontimes[9]);
        if (reactiontimes.length > 10)
            data.rt11 = Math.round(reactiontimes[10]);
        if (reactiontimes.length > 11)
            data.rt12 = Math.round(reactiontimes[11]);
        if (reactiontimes.length > 12)
            data.rt13 = Math.round(reactiontimes[12]);
        if (reactiontimes.length > 13)
            data.rt14 = Math.round(reactiontimes[13]);
        if (reactiontimes.length > 14)
            data.rt15 = Math.round(reactiontimes[14]);

        jsPsych.pluginAPI.clearAllTimeouts();
        jsPsych.pluginAPI.cancelAllKeyboardResponses();

        gelement.innerHTML = old_html;
        jsPsych.finishTrial(data);
    }

    /**
     * Callback for when the participant presses a valid key.
     */
    function afterResponse(info) {
        if (groups[group_index].record)
            reactiontimes.push(info.rt);

        group_index++;
        if (group_index >= groups.length) {
            finish();
        }
        else {
            drawStimulus();
            installResponse();
        }
    }

    /**
     * Determines the expected height of a line, that is: how much should
     * y advance for each line in a text field.
     *
     * It's a hack, but is seems to work. TextMetrics should - in my
     * opinion - support this.
     *
     * Borrowed and adapted from:
     * https://stackoverflow.com/questions/11452022/measure-text-height-on-an-html5-canvas-element/19547748
     */
    function determineLineHeight(font, font_size) {
        let text = "Hello World";

        let div = document.createElement("div");
        div.innerHTML = text;
        div.style.position = 'absolute';
        div.style.top  = '-9999px';
        div.style.left = '-9999px';
        div.style.fontFamily = font;
        div.style.fontSize = font_size + 'pt'; // or 'px'
        document.body.appendChild(div);
        let height = div.offsetHeight;
        document.body.removeChild(div);
        return height;
    }

    class SprMovingWindowPlugin {
        /**
         * Initiates the trial.
         * @param {Object} parameter
         */
        trial(display_element, trial_pars) {

            setupVariables(display_element, trial_pars);
            installResponse();
            drawStimulus();
            if (trial_pars.trial_duration >= 0) {
                jsPsych.pluginAPI.setTimeout(finish, trial_pars.trial_duration);
            }
        }

    }

    SprMovingWindowPlugin.info = info;
    return SprMovingWindowPlugin;

})(jsPsychModule);
