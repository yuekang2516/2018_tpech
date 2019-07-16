angular
    .module('app')
    .factory('cursorInput', ['$mdToast', function () {
        return function (field, val) {
            let domElement = field[0];

            if (document.selection) {
                // 為none，所以下 focus
                domElement.focus();
                let sel = document.selection.createRange();
                sel.text = val;
            } else if (domElement.selectionStart || domElement.selectionStart === 0) {
                let startPos = domElement.selectionStart;
                let endPos = domElement.selectionEnd;
                let scrollTop = domElement.scrollTop;
                domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
                domElement.selectionStart = startPos + val.length;
                domElement.selectionEnd = startPos + val.length;
                domElement.scrollTop = scrollTop;
            } else {
                domElement.value += val;
            }
            // trigger可以通知ng-model, jquery element的值已經變動, ng-model這時才是正確的內容
            // field -> jquery element, trigger -> jquery function
            field.trigger('change');
        };
    }]);
