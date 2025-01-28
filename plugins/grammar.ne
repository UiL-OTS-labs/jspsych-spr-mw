
@{%
    const parts = require("./parts.js");
    const moo = require("moo");

    const lexer = moo.compile({
                                               // Start of groups
        rec_group_start : "{{#"             ,  // Reaction Time of this group is recorded
        group_start     : "{{"              ,  // Reaction time is not recorded
        group_end       : "}}"              ,  // end of a group

                                               // The next enable bold and italic
                                               // fragments within a sentence
        bold_start      : /<[ ]*b[ ]*>/     ,  
        bold_end        : /<[ ]*[/]b[ ]*>/  ,
        italic_start    : /<[ ]*i[ ]*>/     ,
        italic_end      : /<[ ]*[/]i[ ]*>/  ,

        word_char       : /[^ \r\n\t{}<>]+/ ,  // everything that ain't whitespace or
                                               // needs escaping like {, }, < and >
                                               // interpunction e.g. is typically
                                               // part of a word as they are
                                               // drawn together
        esc_char        : "\\"              ,  // a single \ to escape characters
        escaped_char    : /[\{}<>]/         ,  // { } \ < > need to be escaped in a
                                               // word like \{, \} or \\

        ws              : /[ \r\t]+/        , // none newline white space
        newline         : {match : "\n"     , lineBreaks: true},
    })
%}


# This is to enable the moo lexer
@lexer lexer

# We parse a number of groups to present to the user.
# We allow white space between the groups. The white space is
# now made significant. So you don't have to embed the whitespace inside
# the groups in order to have them "rendered"/appear.
group_list ->
      group                 # a single group can be a group_list
            {%
                function (data) {
                    let list = new parts.GroupList(data[0].text_position)
                    list.push(data[0])
                    return list;
                }
            %}
    | WS                    # white space is part of the group list.
                            # as this makes writing the stimuli easier.
            {%
                function (data) {
                    let list = new parts.GroupList(data[0].text_position);
                    list.push(data[0]);
                }
            %}
    | group_list group      # a group list may be followed by more groups
            {%
                function (data) {
                    data[0].push(data[1])
                    return data[0];
                }
            %}
    | group_list WS         # allow white space between groups
            {%
                function (data) {
                    data[0].push(data[1])
                    return data[0];
                }
            %}

# A group starts with {{ or {{# and ends with a }} we don't allow empty groups
# {{}} or {{#}}
group ->
	  %group_start sentence %group_end # group whose RT is not recorded
        {%
            function (data) {
                let group = new parts.Group(data[0], false, data[1]);
                return group;
            }
        %}
	| %rec_group_start sentence %group_end # group whose RS is recorded
        {%
            function(data) {
                let group = new parts.Group(data[0], true, data[1]);
                return group;
            }
        %}


# A sentece is a number of words in a row.
sentence ->
	  Word                          {%  // A sentence can be a single word.
                                        function(data) {
                                            let sentence = new parts.SentenceList(
                                                data[0].text_position,
                                            );
                                            sentence.push(data[0]);
                                            return sentence;
                                        }
                                    %}
	| WS                            {%  // A sentence can begin with whitespace
                                        function(data) {
                                            let sentence = new parts.SentenceList(
                                                data[0].text_position,
                                            );
                                            sentence.push(data[0]);
                                            return sentence;
                                        }
                                    %}
                                    # A sentence can contain special parts (bold/italic)
    | special_sentence              {% id %}

	| sentence Word                 {%  // After we have obtained words/whitespace
                                        // more Words can follow
                                        function(data) {
                                            let sentence = data[0];
                                            sentence.push(data[1]);
                                            return sentence;
                                        }
                                    %}
    | sentence WS                   {%  //after previous words a whitespace may follow
                                        function(data) {
                                            let sentence = data[0];
                                            sentence.push(data[1]);
                                            return sentence;
                                        }
                                    %}
    | sentence special_sentence     {%  // After a "regular" sentence a special
                                        // sentence (bold/italic) may follow
                                        function(data) {
                                            let sentence = data[0];
                                            let special_sentence = data[1];

                                            function append_to_sentence(part)
                                            {
                                                console.log(toString(sentence.parts.length) + part);
                                                sentence.parts.push(part);
                                            }

                                            special_sentence.parts.forEach(
                                                append_to_sentence
                                            )
                                            return sentence;
                                        }
                                    %}

special_sentence ->  # sentences in bold/italics
      bold_sentence                 {% id %} # id just returns the first element.
    | italic_sentence               {% id %}

# a Bold sentence is a sentence between <b> </b> tags spaces whitin the <> are allowed
bold_sentence -> %bold_start sentence %bold_end {%
                                        // drop italic_start and italic_end, return
                                        // the sentence with all word marked bold.
                                        function(data) {
                                            let sentence_fragment = data[1];
                                            sentence_fragment.mark_bold();
                                            return data[1]; // strip start and end
                                        }
                                    %}

# a italic sentence is a sentence between <i> </i> tags spaces whitin the <> are allowed
italic_sentence -> %italic_start sentence %italic_end {%
                                        // drop italic_start and italic_end, return
                                        // the sentence with all word marked italic.
                                        function(data) {
                                            let sentence_fragment = data[1];
                                            sentence_fragment.mark_italic();
                                            return data[1]; // strip start and end
                                        }
                                    %}

# A word is a sequence of non white space characters. Additionally characters such
# as a part of the start and stop of a group need to be escaped with an \ also
# < and > need to be escaped, because if the grammar doesn't do this, the {, }, <, >
# \ Are parsed as being part of a word.
Word -> %word_char                  {% // eeg a or b
                                        function(data) {
                                            let word = new parts.Word(data[0], data[0].toString());
                                            return word;
                                        }
                                    %}
   | Word %word_char                {% // A word might be follow by more non word_characters
                                        function(data) {
                                            let word = data[0];
                                            let character = data[1].toString();
                                            word.push_word_char(character);
                                            return word;
                                        }
                                    %}
   | %esc_char %escaped_char        {%  // eeg \{ 
                                        function (data) {
                                            // position starts at (the first) \, but
                                            // we capture only the {, } or \
                                            let word = new parts.Word(data[0], data[1].toString());
                                        }
                                    %}
   | Word %esc_char %escaped_char   {% // eeg a\{ the { is appended to a with a{ as result
                                        function (data) {
                                            let word = data[0];
                                            let character = data[2].toString();
                                            word.push_word_char(character);
                                            return word;
                                        } 
                                    %}

# WS in caps contains all whitespace
WS ->
      %ws                           {%
                                        function(data, pos) {
                                            let ws = new parts.WhiteSpace(
                                                data[0],
                                                data[0].toString()
                                            );
                                            return ws;
                                        }
                                    %}
    | %newline                      {%
                                        function(data, pos) {
                                            let nl = new parts.WhiteSpace(
                                                data[0],
                                                data[0].toString()
                                            );
                                            return nl;
                                        }
                                    %}
