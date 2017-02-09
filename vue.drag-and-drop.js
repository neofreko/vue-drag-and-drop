/* globals Vue */
(function () {

    var DragAndDrop = {}
    // singleton property
    Object.defineProperty(DragAndDrop, 'vm', {
        value: {},
        writable: true,
        enumerable: true,
        configurable: true
    });

    DragAndDrop.install = function (Vue) {
        function findParent(fromEl, untilCallbackSatisfiedFunction) {
            if (fromEl == document || fromEl.parentElement == document) {
                return null
            } else {
                if (untilCallbackSatisfiedFunction(fromEl.parentElement)) {
                    return fromEl.parentElement
                } else {
                    findParent(fromEl.parentElement)
                }
            }
        }
        //console.log('DragAndDrop', Vue)
        Vue.directive('drag-and-drop', {
            bind: function (el, binding) {
                var paramSet = [
                    'drag-and-drop',
                    'drag-start',
                    'drag',
                    'drag-over',
                    'drag-enter',
                    'drag-leave',
                    'drag-end',
                    'drop',
                    'draggable',
                    'droppable'
                ]

                Object.defineProperty(el, 'vm', {
                    value: {},
                    writable: true,
                    enumerable: true,
                    configurable: true
                });


                // this element params
                var params = {}
                //for(i in paramSet) {params[i] = undefined}}

                // use the VM so we only have 1 dragging item per app
                //console.log('xbinding', this);
                DragAndDrop.vm._dragSrcEl = null;

                for (var passedParam in binding.value) {
                    if (paramSet.indexOf(passedParam) >= 0) {
                        var camelCase = passedParam.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
                        params[camelCase] = binding.value[passedParam]
                    }
                }

                if (params.draggable === undefined) {
                    params.draggable = true;
                }
                if (params.droppable === undefined) {
                    params.droppable = true;
                }

                //console.log('params', params)
                // transfer "false" => false, "true" => true
                var booleanMaps = {
                    true: true,
                    false: false
                }

                var draggable = booleanMaps[params.draggable];
                var droppable = booleanMaps[params.droppable];
                var emptyFn = function () {};

                el.vm.handleDragStart = function (e) {
                    e.target.classList.add('dragging');
                    DragAndDrop.vm._dragSrcEl = e.target;
                    //console.log('handleDragStart', DragAndDrop.vm)
                    e.dataTransfer.effectAllowed = 'move';
                    // Need to set to something or else drag doesn't start
                    e.dataTransfer.setData('text', '*');
                    //console.log(params.dragStart)
                    if (typeof params.dragStart === 'function') {
                        params.dragStart.call(this, e.target, e);
                    }
                }.bind(this);
                el.vm.handleDragOver = function (e) {
                    if (e.preventDefault) {
                        // allows dropping
                        e.preventDefault();
                    }
                    e.dataTransfer.dropEffect = 'move';
                    e.target.classList.add('drag-over');
                    if (typeof params.dragOver === 'function') {
                        params.dragOver.call(this, e.target, e);
                    }
                    return false;
                }.bind(this);
                el.vm.handleDragEnter = function (e) {
                    if (typeof params.dragEnter === 'function') {
                        params.dragEnter.call(this, e.target, e);
                    }
                    e.target.classList.add('drag-enter');
                }.bind(this);
                el.vm.handleDragLeave = function (e) {
                    if (typeof params.dragLeave === 'function') {
                        params.dragLeave.call(this, e.target, e);
                    }
                    e.target.classList.remove('drag-enter');
                }.bind(this);
                el.vm.handleDrag = function (e) {
                    if (typeof params.drag === 'function') {
                        params.drag.call(this, e.target, e);
                    }
                }.bind(this);
                el.vm.handleDragEnd = function (e) {
                    e.target.classList.remove('dragging', 'drag-over', 'drag-enter');
                    if (typeof params.dragEnd === 'function') {
                        params.dragEnd.call(this, e.target, e);
                    }
                }.bind(this);

                el.vm.handleDrop = function (e) {
                    //console.log('handleDrop', e)
                    e.preventDefault();
                    if (e.stopPropagation) {
                        // stops the browser from redirecting.
                        e.stopPropagation();
                    }
                    // Don't do anything if dropping the same column we're dragging.
                    if (DragAndDrop.vm._dragSrcEl != e.target) {
                        if (typeof params.drop === 'function') {
                            var targetElm = findParent(e.target, function (elm) { return elm.getAttribute('draggable') == 'true'});
                            //console.log('targetElm', targetElm)
                            params.drop.call(this, DragAndDrop.vm._dragSrcEl, targetElm, e);
                        }
                    }
                    return false;
                }.bind(this);

                if (!draggable) {
                    el.vm.handleDragStart = emptyFn;
                    el.vm.handleDragEnter = emptyFn;
                    el.vm.handleDrag = emptyFn;
                    el.vm.handleDragLeave = emptyFn;
                    el.vm.handleDragEnd = emptyFn;
                }
                if (!droppable) {
                    el.vm.handleDrop = emptyFn;
                }
                // setup the listeners
                draggable && el.setAttribute('draggable', 'true');
                //console.log(el.vm)
                el.addEventListener('dragstart', el.vm.handleDragStart, false);
                el.addEventListener('dragenter', el.vm.handleDragEnter, false);
                el.addEventListener('dragover', el.vm.handleDragOver, false);
                el.addEventListener('drag', el.vm.handleDrag, false);
                el.addEventListener('dragleave', el.vm.handleDragLeave, false);
                el.addEventListener('dragend', el.vm.handleDragEnd, false);
                el.addEventListener('drop', el.vm.handleDrop, false);
            },
            unbind: function (el) {
                // shut er' down
                el.classList.remove('dragging', 'drag-over', 'drag-enter');
                el.removeAttribute('draggable');
                el.removeEventListener('dragstart', el.vm.handleDragStart);
                el.removeEventListener('dragenter', el.vm.handleDragEnter);
                el.removeEventListener('dragover', el.vm.handleDragOver);
                el.removeEventListener('dragleave', el.vm.handleDragLeave);
                el.removeEventListener('drag', el.vm.handleDrag);
            }
        });
    }

    if (typeof exports == "object") {
        module.exports = DragAndDrop
        //console.log('exports')
    } else if (typeof define == "function" && define.amd) {
        //console.log('define')
        define('vue-drag-and-drop', [], function () {
            return DragAndDrop
        })
    } else if (window.Vue) {
        //console.log('window.Vue')
        window.DragAndDrop = DragAndDrop
        Vue.use(DragAndDrop)
    }
})()
