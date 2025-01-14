
import * as spr_grammar from "./grammar.js";
import * as nearley from "nearley";
import * as parts from "./parts.js"

export var sprMovingWindow = (function(jspsych) {

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
         * @param {parts.SentencePart} text, the text to draw at ctx
         * @param {Pos} position the position at which to draw text.
         * @param {CanvasRenderingContext2D} ctx the 2d drawing position.
         * @param {string} font_family, the family of the font
         */
        constructor(text, position, ctx, font_family, font_size) {
            if (!(text instanceof parts.SentencePart))
                console.error("TextInfo constructor text was not a parts.SentencePart");
            if (!(position instanceof Pos))
                console.error("TextInfo constructor position was not a Pos");
            if (!(ctx instanceof CanvasRenderingContext2D))
                console.error("TextInfo constructor cts was not a valid "+
                              "CanvasRenderingContext2D");
            if (typeof(font_family) !== "string")
                console.error("TextInfo constructor font_family was not a String");
            this.bold = text.bold;
            this.italic = text.italic;
            this.pos = position;
            this.ctx = ctx
            this.font_family = font_family;
            this.font_size = font_size;
            this.text = text.get_content();
            this.metrics = this.getTextMetrics();
        }

        drawText() {
            this.ctx.font = this.getFontDescription();
            this.ctx.fillText(this.text, this.pos.x, this.pos.y);
        }

        getTextMetrics() {
            this.ctx.font = this.getFontDescription();
            return this.ctx.measureText(this.text);
        }

        getFontDescription() {
            let font_desc = "";
            if (this.italic)
                font_desc += "italic "
            if (this.bold)
                font_desc += "bold "
            font_desc += (this.font_size + "px ");
            font_desc += this.font_family;
            return font_desc;
        }

        drawUnderline() {
            this.ctx.beginPath();
            this.ctx.moveTo(this.pos.x, this.pos.y);
            this.ctx.lineTo(this.pos.x + this.metrics.width, this.pos.y);
            this.ctx.stroke();
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

    let group_index = 0;        // the nth group of words that should be presented.
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
        let parsed_stimulus = parseSpr(stimulus);
        groups = createGroups(parsed_stimulus);
        console.log(groups);
        gatherWordInfo(parsed_stimulus, trial_pars);
    }

    /**
     * @param {<Array>.<parts.GroupList>} parsed_stim
     *
     * @returns {GroupInfo[]}
     */
    function createGroups(parsed_stim) {
        let groups = parsed_stim.groups;

        let context = {
            groups : [],
            index : 0
        };

        groups.forEach(
            function (group) {
                let group_indices = [];
                let record = group.record;
                let sentence_parts = group.sentence_parts.parts;
                sentence_parts.forEach(
                    function(part) {
                        if (part.get_type() == "Word") {
                            group_indices.push(context.index);
                            context.index++;
                        }
                    }
                );

                context.groups.push(new GroupInfo(group_indices, record));
            }
        );
        return context.groups
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
    function gatherWordInfo(parsed_stimulus, trial_pars) {

        let delta_y = determineLineHeight(
            trial_pars.font_family,
            trial_pars.font_size,
        ) * trial_pars.line_height_multiplier;
        // We could add this to the trial_pars.
        let y = delta_y;
        let word = 0;
        const BASE_Y = delta_y; // The height on which lines begin.
        const BASE_X = determineLineHeight(trial_pars.font_family, trial_pars.font_size);

        let context = {
            pos : new Pos(BASE_X, BASE_Y),
        };

        function advanceWhiteSpace(context, ws) {
            if (ws.get_content() == "\n") {
                context.pos.x = BASE_X;
                context.pos.y = context.pos.y + delta_y;
            }
            else {
                let info = new TextInfo(
                    ws,
                    new Pos(context.pos.x, context.pos.y),
                    ctx,
                    trial_pars.font_family,
                    trial_pars.font_size,
                );
                context.pos.x += info.width();
            }
        }

        function advanceWord(context, word) {
            let info = new TextInfo(
                word,
                new Pos(context.pos.x, context.pos.y),
                ctx,
                trial_pars.font_family,
                trial_pars.font_size
            );
            words.push(info)
            context.pos.x += info.width();
        }

        let groups = parsed_stimulus.groups;
        groups.forEach(
            group => {
                let parts = group.sentence_parts.parts;
                parts.forEach(
                    part => {
                        if (part.get_type() == "WhiteSpace") {
                            advanceWhiteSpace(context, part);
                        }
                        else if (part.get_type() == "Word") {
                            advanceWord(context, part);
                        }
                    }
                );
            }
        );

//        for (let line = 0; line < lines.length; line++) {
//            let liney = BASE_Y + line * delta_y;
//            let fragments = lines[line].split(RE_CAP_WHITE_SPACE);
//            fragments = fragments.filter( word => {return word != "";});
//            let runningx = BASE_X;
//            for (let fragment = 0; fragment < fragments.length; fragment++) {
//                let current_fragment = fragments[fragment];
//                let pos = new Pos(runningx, liney);
//                let current_word = new TextInfo(
//                    current_fragment,
//                    pos,
//                    ctx,
//                    trial_pars.font_family,
//                    trial_pars.font_size
//                );
//                if (!current_word.isWhiteSpace())
//                    words.push(current_word);
//                runningx += current_word.width();
//            }
//        }
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

/**
 * Parses a stimulus and returns a GroupList that contains the
 * groups of words that should be presented simultaneously in the spr.
 *
 */
function parseSpr(stimulus) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(spr_grammar))
    parser.feed(stimulus)
    let tree = parser.results
    if (tree.length > 1) {
        console.error("The grammar is ambigious for this stimulus");
    }
    else if (tree.length == 0) {
        console.log("stimulus: \"" + stimulus +
            "\"seems incomplete, parsing didn't finish");
    }
    return tree[0];
}

/**
 * 
 * @param {Array.<object>} trials is a list of trials
 * @param {Array.<object>.stimulus} stimulus a stimulus for this trial
 * 
 */
export function checkStimuliSyntax(list)
{
    list.forEach(trial => {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(spr_grammar))
        parser.feed(trial.stimulus)
        let tree = parser.results
        if (tree.length > 1) {
            console.error("Oops, grammar is ambiguous.");
        }
        else if (tree.length == 0) {
            console.error("Oops parsing didn't complete: " + trial +
                "did you feed an entire string?\n");
        }
    });
}
