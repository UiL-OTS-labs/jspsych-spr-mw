# jspsych-spr-mw
## A self paced reading with moving window experiment using jsPsych

## Make your experiment ready for use with the data server
### Update access key
In the file globals.js is a variable:
```javascript
const ACCESS_KEY = '00000000-0000-0000-0000-000000000000';
```
For uploading to the UiL-OTS data server you need to change this
to the access_key that you have obtained when your experiment has
been approved. Your personal access key should look identical, but
all the '0' have changed. For elaborate info see globals.js.

### Adapting stimuli
In the file stimuli.js are a number of variables you can tweak
in order to adapt the stimuli the participants sees. There
are by default 2 groups, each group gets its own
list of stimuli assigned. This list can be used to implement
the Latin square. In the boilerplate are sentences in an
active, passive and filler condition. The two list complement
each other, so an active stimulus in the first list is complemented
with a passive stimulus in the second list. Participants
assigned to the first group get the first list, participants assigned
to the second group get the 2nd list. You can add additional groups
and list if your experiment requires this. This would make it more difficult
to implement the Latin square.

### Presenting multiple words as one group
The boilerplate experiment treats every word in the stimuli as a
group of its own containing one word. Sometimes it is handy to group
multiple words together, to shorten the time it takes to complete the
experiment for example. This is possible, but must be enabled. In the file
globals.js is another variable:
```javascript
const GROUPING_STRING = null;
```
To enable grouping you must define a useful delimiter between groups.
A little bit further in the file is a commented version of:
```javascript
const GROUPING_STRING = "/";
```
So in order to enable grouping comment the first version and uncomment
the latter. In theory you can fill out any string instead of the `"/"`.
Notice the string is turned into a regular expression in order to split
the stimulus into parts and to remove the `/` in the case described here.
```javascript
re = RegExp(GROUPING_STRING,'gu');
```
So make sure if you are going to be creative, that the expression is valid.
### Goodluck, hopefully this experiment is usefull to you.
