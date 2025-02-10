
/**
 * Class representing the position of a portion of the grammar
 */
export class PositionInfo {

    /**
     * 
     * @param {object} tokenised Where the token is found by the lexer
     * @param {number} tokenised.col
     * @param {number} tokenised.line
     * @param {number} tokenised.lineBreaks
     * @param {number} tokenised.offset
     */
    constructor(tokenised) {
        try {
            if (typeof tokenised.col !== "number") {
                throw new TypeError("tokenised.column should be a number");
            }
            if (typeof tokenised.line !== "number") {
                throw new TypeError("tokenised.line should be a number");
            }
            if (typeof tokenised.lineBreaks !== "number") {
                throw new TypeError("tokenised.lineBreaks should be a number");
            }
            if (typeof tokenised.offset !== "number") {
                throw new TypeError("tokenised.offset should be a number");
            }
        } catch (e) {
            let breakpoint = e;
        }

        this.col = tokenised.col;
        this.line = tokenised.line;
        this.lineBreaks = tokenised.lineBreaks;
        this.offset = tokenised.offset;
    }
}

/**
 * A grammar part is one symbol inside of the parsed text.
 * It can be a terminal or non terminal part of the grammar.
 */
export class GrammarPart {

    /**
     * @constructor
     * @param {string} type_name What constinuent of the grammar this object is
     * @param {PositionInfo} text_position Where is the constinuent in the parsed string
     */
    constructor(type_name, text_position) {
        if (typeof type_name !== "string") {
            throw new TypeError("type_name should be a string");
        }
        if (typeof text_position !== "object") {
            throw new TypeError("type_name should be an object");
        }
        this.grammar_type_name = type_name;
        this.text_position = new PositionInfo(text_position);
    }

    /**
     * 
     * @returns {string} What kind of symbol of the grammar this is
     */
    get_type () {
        return this.grammar_type_name;
    }

    /**
     * 
     * @returns {PositionInfo} Information about where this grammar symol
     *                         is inside the text.
     */
    get_position() {
        return this.text_position;
    }
}

export class SentenceList extends GrammarPart {

    /**
     * @constructor
     * @param {PositionInfo} position 
     */
    constructor(position) {
        super("SentenceList", position)
        this.parts = [];
    }

    /**
     * 
     * @param {SentencePart} part 
     */
    push(part) {
        if (part instanceof SentencePart)
            this.parts.push(part);
        else
            throw new TypeError("Part was expected to be a SentencePart")
    }

    mark_bold() {
        this.parts.forEach(
            function(value) {
                value.mark_bold();
            }
        );
    }
    
    mark_italic() {
        this.parts.forEach(
            function(value) {
                value.mark_italic();
            }
        );
    }
}

export class SentencePart extends GrammarPart {

    bold = false;
    italic = false;

    /**
     * 
     * @param {string} type 
     * @param {PositionInfo} position 
     * @param {string} content 
     */
    constructor(type, position, content) {
        super(type, position);
        if (typeof(content) !== "string")
            throw TypeError("text is not a string.");
        this.content = content;
        this.bold = false;
        this.italic = false
    }

    get_content() {
        return this.content;
    }
    
    mark_bold() {this.bold = true;}
    mark_italic() {this.italic = true;}
}


// Words are different from WhiteSpace in terms of
// how they are used by the self paced reading.
// That explains the code duplication.
export class Word extends SentencePart {

    /**
     * @param {PositionInfo} position 
     * @param {string} text 
     */
    constructor (position, text) {
        super("Word", position, text);
    }

    push_word_char(c) {
        this.content += c;
    }
}

export class WhiteSpace extends SentencePart {

    /**
     * @constructor
     * @param {PositionInfo} position 
     * @param {string} text 
     */
    constructor (position, text) {
        super("WhiteSpace", position, text);
    }
};

export class Group extends GrammarPart {

    /**
     * @param {PositionInfo} position 
     * @param {boolean} record 
     * @param {SentenceList} sentence_parts 
     */
    constructor(position, record, sentence_parts) {
        super("Group", position);
        if (typeof record !== "boolean")
            throw new TypeError("Record was expected to be boolean")
        this.record = record
        this.sentence_parts = sentence_parts;
    }
}

export class GroupList extends GrammarPart {
    /**
     * 
     * @param {PositionInfo} position 
     */
    constructor (position) {
        super("GroupList", position);
        this.groups = []
    }

    /**
     * Push a single group to the list of groups
     * 
     * @param {Group} group 
     */
    push(group) {
        this.groups.push(group)
    }
};

