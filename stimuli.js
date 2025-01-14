// Item types
const PASSIVE   = "PASSIVE";
const ACTIVE    = "ACTIVE";
const FILLER    = "FILLER";
const PRAC      = "PRAC";

// experimental, filler and practice items from:
// Caterina Laura Paolazzi, Nino Grillo, Artemis Alexiadou & Andrea Santi (2019)
// Passives are not hard to interpret but hard to remember: evidence from
// online and offline studies, Language, Cognition and Neuroscience,
// 34:8, 991-1015, DOI: 10.1080/23273798.2019.1602733.
// Questions made up by Iris Mulders.

// Lists if you use server side balancing make sure they match the lists
// in the target groups, this is case sensitive.
const LISTS = [
    "list1",
    "list2"
    // "list3"
];

const PRACTICE_ITEMS = [
    {
        id : 1,
        item_type : PRAC,
        //Every word, space "enter" between a pair of {{ and }} is presented
        //together as one group of words. If a group starts with a {{#, the reaction
        //will be recorded. Don't put any characters outside of the {{}}} characters
        //as the grammar for shaping the self paced reading doesn't like that.
        //
        //You can go to the next line in this file by adding (+) to strings
        //together.
        //
        //You are allowed to present words in html style bold and italic tags
        //You can use bold and italic together, but an entire
        //<b>this is <i>correct</i></b>,
        //<b><i>but<b/> this isn't</i> as the entire italic phrase must be captured
        //inside the bold tag. Open a new tag when the overlap partially.
        //<b><i>but</i></b><i>this is</i> valid.
        stimulus :
            "{{The <b>teacher took <i>the car</i></b><i> instead</i> of}} {{the }}{{express }}"    + // string1
            "{{train\n}}{{due to the previously announced public\n"                                 + // string2
            "transport strike.}}", // use a comma here on the final line of your stimulus.             // final string
        question : "",                                            // An empty string means no question for this trial.
        qanswer : undefined                                       // We can't define a answer if there ain't no question.
    },
    {
        id : 2,
        item_type : PRAC,
        stimulus :
            "{{The researcher presented his most recent work\n}}"   +
            "{{to }}{{the }}{{commission }}{{and obtained very positive\n"    +
            "comments regarding the experimental design.}}"     ,
        question : "The researcher presented old work.",
        qanswer : FALSE_BUTTON_TEXT                               // Use TRUE_BUTTON_TEXT if the answer is true,
                                                                  // FALSE_BUTTON_TEXT otherwise
    }
];

/*
 * In this list there is a stimulus, if a group of words starts with a
 * '{{#' it's reaction time will be recorded.
 */
const LIST_GROUP1 = [
    {
        id : 1,
        item_type : PASSIVE,
        stimulus :
            "{{The guitarist was rejected by }}{{#the }}{{#attractive }}{{#and\n}}"                 +
            "{{#talented }}{{#singer }}{{#in }}{{#the }}{{#concert }}{{#hall }}{{#next }}{{#to\n}}" +
            "{{#the }}{{#Irish }}{{#pub.\n}}",
        question : "The singer was attractive.",
        qanswer : TRUE_BUTTON_TEXT
    },
    {
        id : 2,
        item_type : ACTIVE,
        stimulus :
            "{{The sculptor mugged }}{{#the }}{{#strange }}{{#and\n}}"                      +
            "{{#temperamental }}{{#photographer }}{{#in }}{{#the }}{{#art }}{{#gallery\n}}" +
            "{{#next }}{{#to }}{{#the }}{{#book }}{{#shop.\n}}"                             ,
        question : "",
        qanswer : undefined
    },
    {
        id : 3,
        item_type : FILLER,
        stimulus :
            "{{The beautiful princess married her young and\n}}"                +
            "{{handsome }}{{chauffeur }}{{and }}{{shocked }}{{the royal\n"      +
            "family and the press.\n}}",
        question : "The chauffeur was an old man.",
        qanswer : FALSE_BUTTON_TEXT
    },
    {
        id : 4,
        item_type : FILLER,
        stimulus :
            "{{The little girl did not play with her brother\n}}"                               +
            "{{in }}{{the }}{{colourful }}{{playground }}{{next }}{{to }}{{their }}{{weedy\n}}" +
            "{{garden.\n}}",
        question : "",
        qanswer : undefined
    }
];

/*
 * In this list there is a stimulus, if a word starts with a '#' its
 * reaction time will be recorded. So don't put any '#" elsewhere...
 */
const LIST_GROUP2 = [
    {
        id : 1,
        item_type : ACTIVE,
        stimulus :
            "{{The guitarist rejected }}{{#the }}{{#attractive }}{{#and\n}}"                        +
            "{{#talented }}{{#singer }}{{#in }}{{#the }}{{#concert }}{{#hall }}{{#next }}{{#to\n}}" +
            "{{#the }}{{#Irish }}{{#pub.\n}}",
        question : "The singer was attractive.",
        qanswer : TRUE_BUTTON_TEXT
    },
    {
        id : 2,
        item_type : PASSIVE,
        stimulus :
            "{{The sculptor was mugged by }}{{#the }}{{#strange }}{{#and\n}}"               +
            "{{#temperamental }}{{#photographer }}{{#in }}{{#the }}{{#art }}{{#gallery\n}}" +
            "{{#next }}{{#to }}{{#the }}{{#book }}{{#shop.\n}}",
        question : "",
        qanswer : undefined
    },
    {
        id : 3,
        item_type : FILLER,
        stimulus :
            "{{The beautiful princess married her young and\n}}"                    +
            "{{handsome }}{{chauffeur }}{{and }}{{shocked }}{{the }}{{royal\n}}"    +
            "{{family and the press.\n}}",
        question : "The chauffeur was an old man.",
        qanswer : FALSE_BUTTON_TEXT
    },
    {
        id : 4,
        item_type : FILLER,
        stimulus :
            "{{The little girl did not play with her brother\n}}"           +
            "{{in }}{{the }}{{colourful }}{{playground }}{{next }}{{to their weedy\n"         +
            "garden.\n}}"                                                 ,
        question : "",
        qanswer : undefined
    }
];

// Add a third list of stimuli when required.
// const LIST_GROUP3 = [
// ...
// ]

// These lists are not a between subjects variable, but
// define which list a participant gets.
const TEST_ITEMS = [
    {list_name: LISTS[0], table: LIST_GROUP1},
    {list_name: LISTS[1], table: LIST_GROUP2}
    // Add a third list here, put a comma on the
    // end of the line above here.
    // {list_name: LISTS[1], table: LIST_GROUP3}
];

