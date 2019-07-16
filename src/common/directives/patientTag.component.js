angular.module('app').component('patientTag', {
    template: `
    <div class="badge" ng-class="{pointer:$ctrl.editable}" ng-style="{'background-color': $ctrl.tag.TagBgColor}">
        <span ng-style="{color: $ctrl.tag.TagColor, 'background-color': $ctrl.tag.TagBgColor, 'font-style': $ctrl.tag.FontStyle, 'text-decoration': $ctrl.tag.LineThrough , 'font-weight': $ctrl.tag.FontWeight }" ng-click="$ctrl.edit()">
            {{$ctrl.tag.TagName}}
        </span>
        <md-icon ng-if="$ctrl.editable == true" ng-click="$ctrl.delete()">
            <i class="material-icons">clear</i>
        </md-icon>
    </div>
`,
    bindings: {
        tag: '<',
        onEdit: '&',
        onDelete: '&',
        editable: '<'
    },
    controller: function () {
        const self = this;
        console.log(self.tag);
        console.log('enter patient tag component');

        self.delete = function () {
            self.onDelete();
        };
        self.edit = function () {
            self.onEdit();
        };

    }
});
