
@{%

    const parts = require("./parts.js");
    const moo = require("moo");
//    import * as moo from "moo";

    const lexer = moo.compile({
        rec_group_start : "{{#"                 ,
        group_start     : "{{"                  ,
        group_end       : "}}"                  ,
        bold_start      : /<[ ]*b[ ]*>/u        ,
        bold_end        : /<[ ]*[/]b[ ]*>/u     ,
        italic_start    : /<[ ]*i[ ]*>/u        ,
        italic_end      : /<[ ]*[/]i[ ]*>/u     ,
        word            : /\p{L}+/u             ,
        ws              : /[ \r\t]+/u           ,
        newline         : {match : "\n", lineBreaks: true},
    })
%}

@lexer lexer

# We parse a number of groups to present to the user.
group_list ->
      group                 # a single group can be a group_list
    | group_list group      # a group may be a group followed by more groups
    | group_list WS group   # allow white space between groups
    | group_list WS         # allow trailing white space

# A group starts with {{ or {{# and ends with a}} we don't allow empty groups
# {{}} or {{#}}
group ->
	  %group_start sentence %group_end
	| %rec_group_start sentence %group_end


sentence ->
	  Word                          {%
                                        function(data) {
                                            let sentence = new parts.SentenceList(
                                                data[0].text_position,
                                            );
                                            sentence.push(data[0]);
                                            return sentence;
                                        }
                                    %}
	| WS                            {%
                                        function(data) {
                                            let sentence = new parts.SentenceList(
                                                data[0].text_position,
                                            );
                                            sentence.push(data[0]);
                                            return sentence;
                                        }
                                    %}
    | special_sentence              {% id %}

	| sentence Word                 {%
                                        function(data) {
                                            let sentence = data[0];
                                            sentence.push(data[1]);
                                            return sentence;
                                        }
                                    %}
    | sentence WS                   {%
                                        function(data) {
                                            let sentence = data[0];
                                            sentence.push(data[1]);
                                            return sentence;
                                        }
                                    %}
    | sentence special_sentence     {%
                                        function(data) {
                                            let sentence = data[0];
                                            let special_sentence = data[1];

                                            function append_to_sentence(part)
                                            {
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

bold_sentence -> %bold_start sentence %bold_end {%
                                        // drop italic_start and italic_end, return
                                        // the sentence with all word marked italic.
                                        function(data) {
                                            let sentence_fragment = data[1];
                                            sentence_fragment.mark_bold();
                                            return data[1]; // strip start and end
                                        }
                                    %}

italic_sentence -> %italic_start sentence %italic_end {%
                                        // drop italic_start and italic_end, return
                                        // the sentence with all word marked italic.
                                        function(data) {
                                            let sentence_fragment = data[1];
                                            sentence_fragment.mark_italian();
                                            return data[1]; // strip start and end
                                        }
                                    %}

Word -> %word                       {%
                                        function(data, pos) {
                                            let word = new parts.Word(
                                                data[0],
                                                data[0].toString()
                                            );
                                            return word;
                                        }
                                    %}

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
                                            let ws = new parts.WhiteSpace(
                                                data[0],
                                                data[0].toString()
                                            );
                                            return ws;
                                        }
                                    %}
