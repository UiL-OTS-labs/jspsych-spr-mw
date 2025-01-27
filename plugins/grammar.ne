
@{%
    const parts = require("./parts.js");
    const moo = require("moo");

    const lexer = moo.compile({
        rec_group_start : "{{#"             ,
        group_start     : "{{"              ,
        group_end       : "}}"              ,
        bold_start      : /<[ ]*b[ ]*>/     ,
        bold_end        : /<[ ]*[/]b[ ]*>/  ,
        italic_start    : /<[ ]*i[ ]*>/     ,
        italic_end      : /<[ ]*[/]i[ ]*>/  ,
        // A word is a sequence of non white space characters
        // It's non-greedy as e.g. }} must not be seen as end of a word.
        word            : /[^ \r\n\t]+?/    ,
        ws              : /[ \r\t]+/        ,
        newline         : {match : "\n"     , lineBreaks: true},
    })
%}

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

# A group starts with {{ or {{# and ends with a}} we don't allow empty groups
# {{}} or {{#}}
group ->
	  %group_start sentence %group_end
        {%
            function (data) {
                let group = new parts.Group(data[0], false, data[1]);
                return group;
            }
        %}
	| %rec_group_start sentence %group_end
        {%
            function(data) {
                let group = new parts.Group(data[0], true, data[1]);
                return group;
            }
        %}


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
                                        // the sentence with all word marked bold.
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
                                            sentence_fragment.mark_italic();
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
                                            let nl = new parts.WhiteSpace(
                                                data[0],
                                                data[0].toString()
                                            );
                                            return nl;
                                        }
                                    %}
