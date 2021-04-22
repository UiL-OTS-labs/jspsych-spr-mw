# jspsych-spr-mw

## A self paced reading with moving window experiment using jsPsych
This is a small boilerplate experiment for Self Paced Reading (SPR) with a
moving window. Participants read sentences consisting of lines. Single
words or groups of words are revealed when participants press a key (space-bar). An occasional
question is asked to see whether they comprehend the text they have been
reading.

## Generic documentation
Please read the [generic documentation](https://github.com/UiL-OTS-labs/jspsych-uil-template-docs) for some context.

## Make your experiment ready for use with the data server

### Update access key
In the file `globals.js` is a variable:
```javascript
const ACCESS_KEY = '00000000-0000-0000-0000-000000000000';
```
For uploading to the UiL-OTS data server you will need to change
this to the access_key that you obtained when your experiment
was approved. Your personal access key should look identical, but
with all the '0' changed. For elaborate info see `globals.js`.

### Adapting stimuli
In the file `stimuli.js` are a number of variables you can tweak
in order to adapt the stimuli the participants sees. There
are by default 2 lists. Each list gets its own
set of stimuli assigned. These lists can be used to implement
a Latin square design. The boilerplate has sentences in an
active, passive and filler condition. The two list complement
each other, so an active stimulus in the first list is complemented
with a passive stimulus in the second list. Participants get one of these
lists assigned randomly. You can add additional lists if your experiment
requires this. This would make it more difficult
to implement the Latin square.

### Presenting multiple words as one group
The boilerplate experiment treats every word in the stimuli as a
group of its own containing one word. Sometimes it is handy to group
multiple words together, to shorten the time it takes to complete the
experiment for example. This is possible, but must be enabled. In the file
`globals.js` is another variable:
```javascript
const GROUPING_STRING = null;
```
To enable grouping you must define a useful delimiter between groups.
A little bit further in the file there's a commented version of this:
```javascript
const GROUPING_STRING = "/";
```
So in order to enable grouping, comment the first version and uncomment
the latter. In theory you can fill out any string instead of the `"/"`
(useful in case you need to use / in a stimulus).
Notice the string is turned into a regular expression in order to split
the stimulus into parts and to remove the `/` in the case described here.
```javascript
re = RegExp(GROUPING_STRING,'gu');
```
So make sure if you are going to be creative, that the expression is valid.

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
In addition to the RTsm three variables are added to the output:

1. **id**
2. **item_type**
3. **uil_save**

The **id** (which you assign in `stimulus.js`) of the stimulus identifies 1
specific stimulus from your list. It is typically 1 to n, where n is the number
of items in your list. 

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
2. **item_type** (similar to the id in the section of the SPR stimulus above)
3. **expected_answer**: the answer that would be correct.
4. **uil_save** (similar to the id in the section of the SPR stimulus above)
5. **Answer** the answer that the participant gave; one of [false, true].
6. **correct** whether the given answer was the correct answer.

## Good luck, hopefully this experiment is useful to you.

[1]:<https://github.com/UiL-OTS-labs/jspsych-output>
[2]:<https://www.jspsych.org/plugins/overview/#list-of-available-plugins>
