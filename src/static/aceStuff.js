var AceCompleter = (function () {
    function AceCompleter(editor, provider) {
        this.tooltipId = 'suggestion-description';
        this.editor = editor;
        this.provider = provider;
    }
    AceCompleter.prototype.getCompletions = function (editor, session, position, prefix, callback) {
        this.handlePopup(this.editor.aceEditor.completer);
        var _this = this;
        if (prefix) {
            var completionsList = this.getCompletionsList(prefix);
            var convertedList = (completionsList ? completionsList : []).map(function (suggestion) {
                var text = suggestion.text;
                var index = text.lastIndexOf(':');
                if (index > 0 && text.length === index + 1) {
                    text = text.substr(0, text.lastIndexOf(':'));
                }
                return { name: "", value: text, score: 1, meta: "", description: suggestion.description, prefix: prefix };
            });
            callback(null, convertedList);
            return;
        }
        callback(null, []);
    };
    AceCompleter.prototype.handlePopup = function (completer) {
        var _this = this;
        var popup;
        var showDescription = function (popup) { return _this.showDescription(popup); };
        var hideDescription = function () { return _this.hideDescription(); };
        if (completer.popup) {
            return;
        }
        Object.defineProperty(completer, "popup", {
            configurable: true,
            set: function (value) {
                popup = value;
                popup.on('select', function (event) {
                    showDescription(popup);
                });
                popup.on('show', function (event) {
                    showDescription(popup);
                });
                popup.on('hide', function (event) {
                    hideDescription();
                });
            },
            get: function () {
                return popup;
            }
        });
    };
    AceCompleter.prototype.showDescription = function (popup) {
        var data = popup.getData(popup.getSelection().getCursor().row);
        if (!data || !data.description || data.description.length === 0) {
            this.hideDescription();
            return;
        }
        var element = document.getElementById(this.tooltipId);
        if (!element) {
            element = document.createElement('div');
            element.id = this.tooltipId;
            element.className = this.tooltipId;
            var left = popup.container.offsetLeft;
            var top = popup.container.offsetTop;
            var width = popup.container.offsetWidth;
            var height = popup.container.offsetHeight;
            element.style.left = left + 'px';
            element.style.top = (top + height) + 'px';
            element.style.width = width + 'px';
            element.style.zIndex = '100';
            document.body.appendChild(element);
        }
        element.innerHTML = '<span>' + data.description + '</span>';
    };
    AceCompleter.prototype.hideDescription = function () {
        var tooltip = document.getElementById(this.tooltipId);
        if (tooltip) {
            document.body.removeChild(tooltip);
        }
    };
    AceCompleter.prototype.getCompletionsList = function (prefix) {
        var request = { editor: this.editor, prefix: prefix};
        return this.provider.getSuggestions(request);
    };
    return AceCompleter;
})();
exports.AceCompleter = AceCompleter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hdG9tL3JhbWwxL2FjZVN0dWZmLnRzIl0sIm5hbWVzIjpbIkFjZUNvbXBsZXRlciIsIkFjZUNvbXBsZXRlci5jb25zdHJ1Y3RvciIsIkFjZUNvbXBsZXRlci5nZXRDb21wbGV0aW9ucyIsIkFjZUNvbXBsZXRlci5oYW5kbGVQb3B1cCIsIkFjZUNvbXBsZXRlci5zaG93RGVzY3JpcHRpb24iLCJBY2VDb21wbGV0ZXIuaGlkZURlc2NyaXB0aW9uIiwiQWNlQ29tcGxldGVyLmdldENvbXBsZXRpb25zTGlzdCJdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXJDO0lBS0lBLHNCQUFZQSxNQUEwQkE7UUFGdENDLGNBQVNBLEdBQUdBLHdCQUF3QkEsQ0FBQ0E7UUFHakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO0lBQ3pCQSxDQUFDQTtJQUVERCxxQ0FBY0EsR0FBZEEsVUFBZUEsTUFBTUEsRUFBRUEsT0FBT0EsRUFBRUEsUUFBUUEsRUFBRUEsTUFBYUEsRUFBRUEsUUFBUUE7UUFDN0RFLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBRWxEQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUVqQkEsRUFBRUEsQ0FBQUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDUkEsSUFBSUEsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUV0REEsSUFBSUEsYUFBYUEsR0FBR0EsQ0FBQ0EsZUFBZUEsR0FBR0EsZUFBZUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBU0EsVUFBVUE7Z0JBQ2hGLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBRTNCLElBQUks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R0EsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsU0FBU0EsQ0FBQ0E7SUFDaEVBLENBQUNBO0lBRURKLHNDQUFlQSxHQUFmQTtRQUNJSyxJQUFJQSxPQUFPQSxHQUFHQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUV0REEsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDVEEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURMLHlDQUFrQkEsR0FBbEJBLFVBQW1CQSxNQUFhQTtRQUM1Qk0sSUFBSUEsT0FBT0EsR0FBR0EsRUFBQ0EsTUFBTUEsRUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsY0FBY0EsRUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsdUJBQXVCQSxFQUFFQSxFQUFDQSxDQUFDQTtRQUV6R0EsTUFBTUEsQ0FBT0EsUUFBU0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDbkRBLENBQUNBO0lBQ0xOLG1CQUFDQTtBQUFEQSxDQXJIQSxBQXFIQ0EsSUFBQTtBQXJIWSxvQkFBWSxlQXFIeEIsQ0FBQSIsImZpbGUiOiJzcmMvYXRvbS9yYW1sMS9hY2VTdHVmZi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhdG9tV2ViID0gcmVxdWlyZShcIi4vYXRvbVdyYXBwZXJXZWJcIik7XG52YXIgcHJvdmlkZXIgPSByZXF1aXJlKFwiLi9wcm92aWRlclwiKTtcblxuZXhwb3J0IGNsYXNzIEFjZUNvbXBsZXRlciB7XG4gICAgZWRpdG9yOiBhdG9tV2ViLlRleHRFZGl0b3I7XG5cbiAgICB0b29sdGlwSWQgPSAnc3VnZ2VzdGlvbi1kZXNjcmlwdGlvbic7XG5cbiAgICBjb25zdHJ1Y3RvcihlZGl0b3I6IGF0b21XZWIuVGV4dEVkaXRvcikge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGVkaXRvcjtcbiAgICB9XG5cbiAgICBnZXRDb21wbGV0aW9ucyhlZGl0b3IsIHNlc3Npb24sIHBvc2l0aW9uLCBwcmVmaXg6c3RyaW5nLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmhhbmRsZVBvcHVwKHRoaXMuZWRpdG9yLmFjZUVkaXRvci5jb21wbGV0ZXIpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgaWYocHJlZml4KSB7XG4gICAgICAgICAgICB2YXIgY29tcGxldGlvbnNMaXN0ID0gdGhpcy5nZXRDb21wbGV0aW9uc0xpc3QocHJlZml4KTtcblxuICAgICAgICAgICAgdmFyIGNvbnZlcnRlZExpc3QgPSAoY29tcGxldGlvbnNMaXN0ID8gY29tcGxldGlvbnNMaXN0IDogW10pLm1hcChmdW5jdGlvbihzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSBzdWdnZXN0aW9uLnRleHQ7XG5cbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0ZXh0Lmxhc3RJbmRleE9mKCc6Jyk7XG5cbiAgICAgICAgICAgICAgICBpZihpbmRleCA+IDAgJiYgdGV4dC5sZW5ndGggPT09IGluZGV4ICsgMSkge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHIoMCwgdGV4dC5sYXN0SW5kZXhPZignOicpKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB7bmFtZTogXCJcIiwgdmFsdWU6IHRleHQsIHNjb3JlOiAxLCBtZXRhOiBcIlwiLCBkZXNjcmlwdGlvbjogc3VnZ2VzdGlvbi5kZXNjcmlwdGlvbiwgcHJlZml4OiBwcmVmaXh9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGNvbnZlcnRlZExpc3QpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCBbXSk7XG4gICAgfVxuXG4gICAgaGFuZGxlUG9wdXAoY29tcGxldGVyKSB7XG4gICAgICAgIHZhciBwb3B1cDtcblxuICAgICAgICB2YXIgc2hvd0Rlc2NyaXB0aW9uID0gcG9wdXAgPT4gdGhpcy5zaG93RGVzY3JpcHRpb24ocG9wdXApO1xuICAgICAgICB2YXIgaGlkZURlc2NyaXB0aW9uID0gKCkgPT4gdGhpcy5oaWRlRGVzY3JpcHRpb24oKTtcblxuICAgICAgICBpZihjb21wbGV0ZXIucG9wdXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb21wbGV0ZXIsIFwicG9wdXBcIiwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHBvcHVwID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBwb3B1cC5vbignc2VsZWN0JywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzaG93RGVzY3JpcHRpb24ocG9wdXApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcG9wdXAub24oJ3Nob3cnLCBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dEZXNjcmlwdGlvbihwb3B1cCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBwb3B1cC5vbignaGlkZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaGlkZURlc2NyaXB0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwb3B1cDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2hvd0Rlc2NyaXB0aW9uKHBvcHVwKSB7XG4gICAgICAgIHZhciBkYXRhID0gcG9wdXAuZ2V0RGF0YShwb3B1cC5nZXRTZWxlY3Rpb24oKS5nZXRDdXJzb3IoKS5yb3cpO1xuXG4gICAgICAgIGlmKCFkYXRhIHx8ICFkYXRhLmRlc2NyaXB0aW9uIHx8IGRhdGEuZGVzY3JpcHRpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVEZXNjcmlwdGlvbigpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMudG9vbHRpcElkKTtcblxuICAgICAgICBpZighZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgICAgICBlbGVtZW50LmlkID0gdGhpcy50b29sdGlwSWQ7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IHRoaXMudG9vbHRpcElkO1xuXG4gICAgICAgICAgICB2YXIgbGVmdCA9IHBvcHVwLmNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgdmFyIHRvcCA9IHBvcHVwLmNvbnRhaW5lci5vZmZzZXRUb3A7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBwb3B1cC5jb250YWluZXIub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gcG9wdXAuY29udGFpbmVyLm9mZnNldEhlaWdodDtcblxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnRvcCA9ICh0b3AgKyBoZWlnaHQpICsgJ3B4J1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gJzEwMCc7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICc8c3Bhbj4nICsgZGF0YS5kZXNjcmlwdGlvbiArICc8L3NwYW4+JztcbiAgICB9XG5cbiAgICBoaWRlRGVzY3JpcHRpb24oKSB7XG4gICAgICAgIHZhciB0b29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy50b29sdGlwSWQpO1xuXG4gICAgICAgIGlmKHRvb2x0aXApIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodG9vbHRpcCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRDb21wbGV0aW9uc0xpc3QocHJlZml4OnN0cmluZyk6IGFueVtdIHtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSB7ZWRpdG9yOnRoaXMuZWRpdG9yLCBwcmVmaXg6IHByZWZpeCwgYnVmZmVyUG9zaXRpb246dGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKX07XG5cbiAgICAgICAgcmV0dXJuICg8YW55PnByb3ZpZGVyKS5nZXRTdWdnZXN0aW9ucyhyZXF1ZXN0KTtcbiAgICB9XG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9