var Phrase = function() {
    this.phraseList = element.all(by.repeater('w in vm.wards'));
};
module.exports = Phrase;    