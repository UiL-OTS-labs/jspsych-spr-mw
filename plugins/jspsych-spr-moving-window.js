
const SPR_MW_PLUGIN_NAME = 'spr-moving-window';

jsPsych.plugins[SPR_MW_PLUGIN_NAME] = (
    function() {
        var plugin = {};

        plugin.info = {
            name: SPR_MW_PLUGIN_NAME,
            parameters : {
                stimulus : {
                    type :          jsPsych.plugins.parameterType.STRING,
                    pretty_name :   'Stimulus',
                    default :       undefined,
                    description :   'The string to be displayed in' +
                                    'Self paced reading moving window style'
                },
                choices : {
                    type :          jsPsych.plugins.parameterType.KEYCODE,
                    pretty_name :   "Choices",
                    default :       32,
                    description :   "The keys allowed to advance a word."
                },
                background_color : {
                    type :          jsPsych.plugins.parameterType.STRING,
                    pretty_name :   "Background color",
                    default :       "rgb(230,230,230)",
                    description :   "background_color r, g and b value as javascript object such as: " +
                                    "\"rgb(230,230,230)\" or \"gray\""
                },
                font_color : {
                    type :          jsPsych.plugins.parameterType.STRING,
                    pretty_name :   "Font color",
                    default :       'rgb(0,0,0)',
                    description :   "The rgb values in which the letters will be presented, such as: " +
                                    "rgb(0,0,0)"
                },
                font_family : {
                    type :          jsPsych.plugins.parameterType.STRING,
                    pretty_name :   "The familiy of the font that is used to draw the words.",
                    default :       "Times New Roman",
                    description :   "The final font will be computed from the family, and font size"
                },
                font_size : {
                    type :          jsPsych.plugins.parameterType.INT,
                    pretty_name :   "The size of the font.",
                    default :       36,
                    description :   "The final font will be computed from the family, and font size"
                },
                width : {
                    type :          jsPsych.plugins.parameterType.INT,
                    pretty_name :   "width",
                    default :       900,
                    description :   "The width of the canvas in which the spr moving window is presented."
                },
                height : {
                    type :          jsPsych.plugins.INT,
                    pretty_name :   "height",
                    default :       600,
                    description :   "The height of the canvas in which the spr moving window is presented"
                }
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
        const NEWLINE = '\n';
        const WHITE_SPACE = '\\s';
        const CAP_WHITE_SPACE = '(\\s)';
        const INTERPUNCTION = "\\p{P}";
        const WORD_INTERPUNCTION= "^\\p{L}+\\p{P}$";

        const RE_CAP_WORD = RegExp(CAP_WORD, 'u');
        const RE_WORD = RegExp(WORD, 'u');
        const RE_NEWLINE = RegExp(NEWLINE, 'u');
        const RE_WHITE_SPACE = RegExp(WHITE_SPACE, 'u');
        const RE_CAP_WHITE_SPACE = RegExp(CAP_WHITE_SPACE, 'u');
        const RE_INTERPUNCTION = RegExp(INTERPUNCTION, 'u');
        const RE_WORD_INTERPUNCTION= RegExp(WORD_INTERPUNCTION, 'u');
    
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
             * @param {} ctx the 2d drawing position.
             * @param {bool} record whether or not to store this text in the output.
             */
            constructor(text, position, ctx, record = false) {
                if (typeof(text) !== "string")
                    console.error("TextInfo constructor text was not a String");
                if (typeof(record) !== "boolean")
                    console.error("TextInfo constructor positions was not a Pos");
                this.text = text;
                this.pos = position;
                this.record = record;
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

            isWordPlusInterpunction() {
                return this.text.match(RE_WORD_INTERPUNCTION) !== null;
            }

            width() {
                return this.metrics.width;
            }
        }


        // private variables
        
        let word_index = 0;         // the nth_word that should be presented.
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
        
        /**
         * Setup the variables for use at the start of a new trial
         */
        function setupVariables(display_element, trial_pars) {
            // reset state.
            word_index      = 0;
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
            
            createCanvas(display_element, trial_pars);
            ctx.font = font;
            let lines = trial_pars.stimulus.split(RE_NEWLINE);
            gatherWordInfo(lines, trial_pars);
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

            let delta_y = determineLineHeight(trial_pars.font_family, trial_pars.font_size);
            // We could add this to the trial_pars.
            let y = delta_y * 1.5;
            let word = 0;
            const BASE_Y = delta_y * 1.5; // The height on which lines begin.
            const BASE_X = BASE_Y;

            for (let line = 0; line < lines.length; line++) {
                liney = BASE_Y + line * delta_y;
                fragments = lines[line].split(RE_CAP_WHITE_SPACE);
                fragments = fragments.filter( word => {return word != "";});
                let runningx = BASE_X;
                for (let fragment = 0; fragment < fragments.length; fragment++) {
                    let current_fragment = fragments[fragment];
                    let pos = new Pos(runningx, liney);
                    let record = false;
                    if (current_fragment[0] == "#") {
                        record = true;
                        current_fragment = current_fragment.slice(1);
                    }
                    let current_word = new TextInfo(current_fragment, pos, ctx, record);
                    if (current_word.isWord() || current_word.isWordPlusInterpunction())
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
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                let pos = word.pos;
                if (i === word_index) {
                    word.drawText();
                }
                else {
                    word.drawUnderline();
                }
            }
        }

        function installResponse(trial_pars) {
            jsPsych.pluginAPI.getKeyboardResponse(
                {
                    callback_function : afterResponse,
                    valid_responses : [valid_keys],
                    rt_method : 'performance',
                    persist : false, // We reinstall the response, because
                                     // otherwise the rt is cumulative.
                    allow_held_key: false
                }
            );
        }

        function finish() {

            let data = {
                rt1 : -1,
                rt2 : -1,
                rt3 : -1,
                rt4 : -1,
                rt5 : -1,
                rt6 : -1,
                rt7 : -1,
                rt8 : -1,
                rt9 : -1,
                rt10: -1,
            }

            if (reactiontimes.length > 0)
                data.rt1 = reactiontimes[0];
            if (reactiontimes.length > 1)
                data.rt2 = reactiontimes[1];
            if (reactiontimes.length > 2)
                data.rt3 = reactiontimes[2];
            if (reactiontimes.length > 3)
                data.rt4 = reactiontimes[3];
            if (reactiontimes.length > 4)
                data.rt5 = reactiontimes[4];
            if (reactiontimes.length > 5)
                data.rt6 = reactiontimes[5];
            if (reactiontimes.length > 6)
                data.rt7 = reactiontimes[6];
            if (reactiontimes.length > 7)
                data.rt8 = reactiontimes[7];
            if (reactiontimes.length > 8)
                data.rt9 = reactiontimes[8];
            if (reactiontimes.length > 9)
                data.rt10 = reactiontimes[9];

            gelement.innerHTML = old_html;
            jsPsych.finishTrial(data);
        }

        /**
         * Callback for when the participant presses a valid key.
         */
        function afterResponse(info) {
            if (words[word_index].record)
                reactiontimes.push(info.rt);

            word_index++;
            if (word_index >= words.length) {
                finish();
            }
            else {
                drawStimulus();
                installResponse();
            }
        }

        /**
         * Initiates the trial.
         * @param {Object} parameter
         */
        plugin.trial = function(display_element, trial_pars) {

            setupVariables(display_element, trial_pars);
            installResponse();
            drawStimulus();

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
        

        return plugin;
    }
)();
