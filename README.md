# jspsych-spr-mw
A self paced reading with moving window experiment using jsPsych

# Adapting stimuli
In the file stimuli.js are a number of variables you can tweak
in order to adapt the stimuli the participants sees. There
are by default 2 groups, each group gets its own 
list of stimuli assigned. This list can be used to implement
the latin square. In the boilerplate are sententces in an
active, passive and filler condition. The two list complement
each other, so an active stimulus in the first list is complemented
with a passive stimulus in the second list. Participants
assigned to the first group get the first list, participants assigend
to the second group get the 2nd list. You can add additional groups
and list if your experiment requires this. This would make it more difficult
to implement the latin sqare.

