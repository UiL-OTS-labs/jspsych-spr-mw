# jspsych-spr-mw

## A self paced reading with moving window experiment using jsPsych

This is a small boilerplate experiment for Self Paced Reading (SPR) with a
moving window. Participants read sentences formatted in lines. Single
words or groups of words are revealed when participants press a key (space-bar).
An occasional question is asked to see whether they comprehend the text they
have been reading.

## Generic documentation

Please read the
[generic documentation](https://github.com/UiL-OTS-labs/jspsych-uil-template-docs)
for some context.

## Make your experiment ready for use with the data server

### Update access key

The file `globals.js` contains a variable:

```javascript
const ACCESS_KEY = '00000000-0000-0000-0000-000000000000';
```

For uploading to the ILS data server you will need to change
this to the access_key that you obtained when your experiment
was approved. Your personal access key should look identical, but
with all the '0' changed. For elaborate info see `globals.js`.

### Adapting stimuli

The file `stimuli.js` contains a number of variables you can tweak
in order to adapt the stimuli the participants sees. There
are by default 2 lists. Each list gets its own
set of stimuli assigned. These lists can be used to implement
a Latin square design. The boilerplate has sentences in an
active, passive and filler condition. The two lists complement
each other, so an active stimulus in the first list is complemented
with a passive stimulus in the second list. Participants get one of these
lists assigned randomly. You can add additional lists if your experiment
requires this. For instance, to implement a Latin square design for four
conditions, you'd need to create four lists.

### Presenting multiple words as one group

Previously, when the spr was presenting multiple words as one group/simultaneous, you
needed to separate them by inserting e.g. a `/`, as of now, you have to
specifically create groups yourself and grouping of words is always on. On
the. There are two kinds of groups `{{A group of words that is not recorded}}`
`{{#A group of words that is NOT recorded.}}`. Recorded means that the
RT of this group is logged. Of course it is fine to have just one `{{word}}`
in a {{#group}}. the curly braces and # are stripped from the rendered
output. You should not put word letters etc outside of a group.

All the words of your spr need to be enclosed in **{{**double curly braces**}}**
so the phrase "double curly braces" is presented together. If you want the to
be presented individually, you'll need to make three groups such as

```
{{double}} {{curly}} {{braces}}
```

#### White space issues

In the example with three groups above, the " " are put outside of the group
as that might be more readable than e.g.

```
{{double }}{{curly }}{{braces}}
```

In this example the spaces are embedded inside the groups, both methods are
fine, but the author finds the first method better readable. If you put
none white space characters outside of a group it will be considered a syntax error.

#### Presenting **bold** and *italic* words or ***both***

Like HTML you can render words in bold or italic like this:

```
{{a word in <b>bold</b> or some words <i>in italic</i>}}
```

or even both.

```
{{<b><i>Bold and italic</i></b>}}
```

However, the syntax for this is more strict than HTML, forgetting to close a bold
or italic tag will result in an error. The bold or you'll have to close the
innermost group first and then the outermost group. So the following are errors:

1.

        {{<b><i>Oops close i first</b></i>}}

2.

        {{<b>Oops forgot to close b}}

If you want then to be partially overlapping you should open a new group

```
{{<b>Bold <i> and italic</i></b> <i>, only italic</i>
```

## Output

For some general information about understanding the output of jsPsych you
can visit the `README.md` of our [jspsych output][1] github page. This
boilerplate creates its own plugin in order to make an SPR stimulus. Currently this
stimulus is not listed in [jspsych plugin list][2], because it is not part of
the official jsPsych source. So here we describe which output is specific for
the SPR.

### SPR stimulus

The boilerplate has support for 15 groups of words. Remember that a group can
consist of a single word. Groups starting with a `#` in the stimulus list are
added to the output. Each reaction time is in ms. If less than 15 groups are
marked with a `#`, the remaining reactiontimes are set to -1 as an indication
that no response has been given for that word; this marks it as
invalid. The variables are listed as **rt1**, **rt2** **..** **rt15** in the output.
The fixation cross that lures the eyes of the participant to the start of the
sentence is also implemented using the same spr-moving-window plugin, with the
single group/word '+'. All RTs for this trial will be set to -1.
In addition to the RTs three variables are added to the output:

1. **id**
1. **item_type**
1. **uil_save**

The **id** (which you assign in `stimulus.js`) of the stimulus identifies 1
specific stimulus from your list. It is typically 1 to n, where n is the number
of items in your list. (Note that an item will appear in several conditions,
or item types. For instance in the template, the item with id 1 appears in the passive
condition in list 1, and in the passive condition in list 2).

The **item_type** is added to the output, also defined by you in `stimuli.js`.
In contrast the item_type of the fixation cross is always ```FIX_CROSS```.

**uil_save** is added to the output variables to indicate whether this
json opbject or one line in the output of the csv is worth saving, in other
words is really mandatory for the analysis of your experiment. If it is defined
for a trial it is either true or false - a boolean. You can use this boolean
to filter your data. You can first check whether the uil_save is set and
if it is set, you can examine whether it is true and if not, just throw the
row-in-the-csv or JSON object away.

### question stimulus

The question stimulus is a 'html-button-response' type of stimulus. From the
information of [jspsych output][1] you should be able to figure out what jsPsych
adds for each trial. In addition to what jsPsych adds, we add the following
output variables:

1. **id** (similar to the id in the section of the SPR stimulus above)
1. **item_type** (similar to the id in the section of the SPR stimulus above)
1. **expected_answer**: the answer that would be correct.
1. **uil_save** (similar to the id in the section of the SPR stimulus above)
1. **answer** the answer that the participant gave; one of [false, true].
1. **correct** whether the given answer was the correct answer; one of [false, true].
1. **integer_correct** whether the given answer was the correct answer; one of
   [0, 1].

## Good luck, hopefully this experiment is useful to you

[1]:<https://github.com/UiL-OTS-labs/jspsych-output>
[2]:<https://www.jspsych.org/plugins/overview/#list-of-available-plugins>
